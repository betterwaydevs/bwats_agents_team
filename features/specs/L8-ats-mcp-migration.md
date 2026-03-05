# L8: ATS Skill — Migrate from curl/API to Xano MCP

## Summary

Migrate the `/ats` skill from using `curl` against Xano REST APIs to using the BWATS_ATS custom MCP server. This enables the skill to work in Claude Desktop, Claude.ai, and any MCP-capable environment — not just CLI with bash access.

## Context

- The `/ats` skill (L5) currently uses `curl` to call Xano REST endpoints
- Connectivity fails in non-CLI environments (Claude Desktop, etc.) where there's no bash/curl
- Xano supports custom MCP servers that expose tools — we can create tools that wrap existing API logic
- Pablo already created the BWATS_ATS MCP server:
  - **Live**: Workspace 6 (BetterWayDevs), MCP server ID 594
  - **Dev**: ID 602
  - Both are currently empty (no triggers/tools)

## Architecture

```
Current:  Skill → curl → Xano REST API → Business Logic → DB
New:      Skill → MCP tool call → BWATS_ATS trigger → Same Business Logic → DB
```

Each MCP trigger is a thin wrapper that calls the existing API/function logic via `function.run`. No business logic duplication.

### MCP Server URL (VERIFIED)

```
URL:  https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream
Dev:  Add header X-Data-Source: development
Live: Omit header (or set to null)
```

Canonical: `Sk3cINn0`. Uses canonical in URL, NOT server name.

## SAFETY RULES (NON-NEGOTIABLE)

The MCP server MUST NOT expose any destructive operations. These are **hard blocks**:

### NEVER ALLOW via MCP:
- **Delete projects** — no tool to delete or archive projects
- **Delete/remove people from projects** — no tool to delete associations
- **Delete stages** — no tool to remove pipeline stages
- **Delete people** — no tool to delete candidates or prospects from the database
- **Delete events** — no tool to remove scheduled events
- **Any bulk delete** — no bulk operations that remove data

### ALLOWED write operations (safe scope):
- **Move person between stages** — ONLY within the same project (tool must validate `association.project_id` matches)
- **Assign person to project** — add someone to a pipeline stage (creates association, doesn't delete)
- **Update notes** — add/edit notes on candidates or prospects
- **Update application status** — mark as read/processed
- **Create/update events** — schedule interviews, mark complete
- **Create touchpoints** — log outreach actions
- **Create tasks** — create work items

### RESTRICTED writes:
- `change_person_project_association_stage_info` — must validate the target stage belongs to the SAME project as the current association. Moving across projects is NOT allowed.

### Existing Workspace Tools (27 available)

These tools already exist in workspace 6 and can be exposed on the BWATS_ATS server:

**SAFE (read-only) — expose all:**
`search_prospects`, `search_candidates_in_es`, `get_person`, `get_project`, `get_active_projects`, `roles`, `get_users`, `list_open_positions`, `get_all_person_data`, `get_person_project_associations`, `get_touchpoints`, `get_person_activity_history`, `get_person_events`, `get_person_linkedin_associations`, `get_person_videoask`, `task_types`, `pending_tasks_per_person`, `get_role_by_id`, `get_project_stages_by_id`

**SAFE (write, non-destructive) — expose:**
`create_task`, `create_person_to_project_association`, `create_touchpoint`, `call_scoring_agent`, `tasks_create_linked_in_special_outreach_task`

**RESTRICTED (write, needs same-project validation) — expose with guard:**
`change_person_project_association_stage_info` — MUST validate target stage is in same project

**DO NOT EXPOSE:**
`create_stage` — stage creation should be done from the ATS UI, not via MCP

## Phase 1 — MCP Tool Creation & Testing (Dev)

### 1A: Create MCP Triggers on Dev (#602)

Create these tools on the BWATS_ATS MCP server (dev branch). Each trigger wraps an existing API endpoint.

**Read-only tools (core dashboard + browsing):**

| Tool Name | Wraps | Inputs | Returns |
|-----------|-------|--------|---------|
| `auth_validate` | `GET /api:Ks58d17q/auth/me` | `token` | User object (id, name, email, is_admin, is_recruiter) |
| `list_projects` | `GET /api:_dY_2A8p/project` | `status?` | Array of projects |
| `get_project` | `GET /api:_dY_2A8p/project/{id}` | `project_id` | Project detail object |
| `get_pipeline` | `GET stages + counts` | `project_id`, `stage_type?` | Stages array with person counts |
| `list_stage_people` | `GET /association/project/{id}/people` | `project_id`, `stage_id`, `stage_type`, `page?`, `per_page?` | Paginated people list |
| `list_applications` | `GET /api:wosIWFpR/applications/applicants` | `status?`, `page?`, `per_page?`, `keyword?` | Paginated applications |
| `list_events` | `GET /api:wosIWFpR/candidate_events` | `status?` | Array of events |
| `search_candidates` | `POST /api:wosIWFpR/search/candidates` | Search filters (skills, location, salary, etc.) | Paginated ES results |
| `search_prospects` | `POST /api:zE_czJ22/search/prospects` | Search filters | Paginated ES results |
| `get_candidate` | `GET /api:wosIWFpR/parsed_candidate_info/{esId}` | `elastic_search_id` | Full candidate profile |
| `get_prospect` | `GET /api:zE_czJ22/parsed_prospect/{esId}` | `elastic_search_id` | Full prospect profile |
| `list_linkedin_events` | `GET /api:wZiyNifh/linked_in_events` | `timestamp?` | Array of LinkedIn events |
| `task_counts` | `GET /api:i2KWpEI8/tasks/counts` | none | Counts by project and status |

**Write tools (safe, non-destructive only):**

| Tool Name | Wraps | Inputs | Returns | Safety |
|-----------|-------|--------|---------|--------|
| `update_application` | `PATCH /applications/{id}` | `application_id`, `status` | Updated application | Status change only |
| `update_notes_candidate` | `POST /candidates/update_notes` | `candidate_es_id`, `notes` | Success | Additive |
| `update_notes_prospect` | `POST /update_notes` | `prospec_es_id`, `notes` | Success | Additive |
| `move_person` | `POST /association/{id}/change-stage` | `association_id`, `stage_id`, `stage_type` | Updated association | **GUARDED: must validate target stage is in same project as association** |
| `assign_person` | `POST /association/project/{id}/people` | `project_id`, `person_id`, `person_type`, `stage_id?` | New association | Creates, never deletes |
| `create_event` | `POST /candidate_event` | `candidate_id`, `association_id`, `title`, `scheduled_at` | Created event | Creates, never deletes |
| `update_event` | `PATCH /candidate_event/{id}` | `event_id`, fields to update | Updated event | Update only, no delete |
| `search_in_project` | `POST /association/search` | `project_id`, `keyword` | Matched people | Read operation |

**REMOVED (too dangerous for MCP):**
- ~~`create_project`~~ — project creation stays in ATS UI only
- ~~`initialize_stages`~~ — coupled with project creation
- ~~`delete_*` anything~~ — no delete operations exposed

### 1B: Full MCP Connectivity Test on Dev (MANDATORY FIRST STEP)

**Before creating any tools, verify MCP connectivity end-to-end:**

1. Discover the BWATS_ATS MCP server URL on dev (workspace 6, server #602)
2. Initialize an MCP session against it
3. Call `tools/list` to confirm the server responds
4. If the server has any default tools, test them

**This connectivity test is blocking** — do not proceed to tool creation until the MCP server is reachable and responding.

### 1C: Test Each Tool After Creation

For each tool created:
1. Connect to the BWATS_ATS MCP server on dev
2. Call the tool with valid inputs
3. Verify the response matches what the equivalent curl call returns
4. Document any discrepancies

**Test with real dev data** — use existing projects, candidates, and prospects on the dev branch.

### Implementation Strategy: Leverage Existing Endpoints

Each MCP trigger should **call the existing API endpoints internally** (via `api.request` or `function.run`) rather than reimplementing business logic. The triggers are thin wrappers:

```
MCP trigger receives input → builds request → calls existing API/function → returns result
```

This way we reuse all existing validation, joins, pagination, and business logic. The MCP tools are just a new transport layer over the same backend.

### Acceptance Criteria (Phase 1)

- [ ] All 21 MCP tools created on dev (#602) (13 read + 8 write)
- [ ] Each tool tested via MCP call and returns correct data
- [ ] Auth token validation works via MCP (tool receives token as input, validates it)
- [ ] Pagination works on list endpoints
- [ ] Search filters work on candidate/prospect search
- [ ] Write operations (move, assign, create) work correctly
- [ ] `move_person` validates target stage is in SAME project — rejects cross-project moves
- [ ] NO delete operations are exposed — verify `tools/list` contains zero delete tools
- [ ] Error cases return meaningful error messages (not found, unauthorized, validation errors)

## Phase 2 — Skill Rewrite

### 2A: Dual-Mode Skill

Rewrite the ATS skill to support both transports:

```
On skill start:
  1. Check if BWATS_ATS MCP tools are available (try a no-op or list)
  2. If MCP available → use MCP tools for all operations
  3. If MCP not available → fall back to curl (current behavior)
```

This ensures the skill works in:
- **Claude Desktop / Claude.ai** — MCP mode (primary)
- **Claude Code CLI** — curl fallback or MCP if configured

### 2B: Skill Reference Files

Update `references/` files to document MCP tool signatures alongside (or replacing) curl examples.

### Acceptance Criteria (Phase 2)

- [ ] Skill detects MCP availability and chooses transport
- [ ] All dashboard operations work via MCP
- [ ] All CRUD operations work via MCP
- [ ] Search works via MCP
- [ ] Session management adapted for MCP mode (token storage may differ)
- [ ] Skill reference files updated

## Phase 3 — Deploy to Live

### 3A: Push MCP Tools to Live

Push all triggers from dev (#602) to live (#594). Verify each tool works against production data.

### 3B: MCP Configuration for End Users

Document how to add the BWATS_ATS MCP server to:
- Claude Desktop config (`claude_desktop_config.json`)
- Claude Code CLI (`.mcp.json` or settings)

### Acceptance Criteria (Phase 3)

- [ ] All tools working on live MCP server
- [ ] End-user setup documented
- [ ] A recruiter can use `/ats` from Claude Desktop with MCP

## Dependencies

- **L5** (ATS Skill) — This task extends it
- **L6** (CLI Token Page) — Token flow still needed for initial auth

## Technical Notes

- MCP triggers in Xano have their own function stack — use `function.run` or `api.request` to call existing logic
- Auth: The MCP server itself authenticates via `XANO_TOKEN` (instance token). User auth uses the CLI token page (`https://bwats.betterway.dev/cli-token`) — user copies token from browser, pastes into skill. The token is then passed as input to MCP tools that need user-level auth (like `auth_validate`). The MCP triggers validate it server-side via the same auth logic the REST APIs use
- The `prospec_es_id` typo in the prospect notes endpoint must be preserved in the MCP tool (it calls the same backend function)
- Xano tools are branch-independent, but MCP triggers are part of the MCP server definition — check if dev/live have separate trigger sets or shared

## Risks

- ~~**MCP server URL pattern**~~: VERIFIED — canonical `Sk3cINn0`, URL `https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream`
- **Auth model**: Instance token (MCP auth) vs user token (business auth) — need to handle both layers
- **Tool count**: 21 tools — should be fine for MCP clients
- **CRITICAL — Cascading deletes**: Deleting a project can cascade-delete associations, removing people from other projects they're also in. This is why ALL delete operations are banned from the MCP. Learned the hard way during testing.
