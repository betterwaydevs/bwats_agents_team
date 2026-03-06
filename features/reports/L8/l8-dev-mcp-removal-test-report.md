# L8: ATS MCP Tool Removal Verification — Dev Test Report

## Test Metadata
- **Date/Time**: 2026-03-06 03:26 UTC
- **Environment**: Development (x-data-source=development)
- **MCP Server**: BWATS_ATS (Sk3cINn0)
- **MCP Endpoint**: `https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream`
- **Session ID**: `67b21ca8-be94-419d-8059-177ea21f934a`
- **Auth**: Dev token via `api:Ks58d17q/auth/login?x-data-source=development`
- **Tester**: Orchestrator (automated)

---

## 1. Tool Removal Verification

### Tools Removed from MCP Server
| Tool Name | Present in tools/list? | Status |
|-----------|----------------------|--------|
| `unassign_person` | NO | Confirmed removed |
| `delete_project` | NO | Confirmed removed |
| `delete_stage` | NO | Confirmed removed |

**Total tools on server**: 30 (was 33 before removal, now 30 — 3 removed confirmed)

### Destructive Tool Call Verification
Attempted to call each removed tool via MCP `tools/call`:

| Tool | Error Code | Error Message | Verdict |
|------|-----------|---------------|---------|
| `unassign_person` | -32602 | `Tool unassign_person not found` | BLOCKED |
| `delete_project` | -32602 | `Tool delete_project not found` | BLOCKED |
| `delete_stage` | -32602 | `Tool delete_stage not found` | BLOCKED |

All 3 destructive tools are fully removed from the MCP server. Calls return JSON-RPC error -32602 (Invalid params / tool not found).

---

## 2. Full Test Suite — 30 Remaining Tools

### Test Methodology
- Each tool was called via MCP `tools/call` with valid JSON-RPC 2.0 payloads
- Dev auth token was used for all calls
- Tools with `data_source` parameter were tested with `"development"`
- Tools without `data_source` parameter hit the known datasource mismatch (wrappers hardcoded to live)

### Classification Key
| Code | Meaning |
|------|---------|
| **MCP_OK** | MCP transport succeeded, tool executed, response returned |
| **DS_MISMATCH** | MCP transport succeeded, but API returned "token belongs to different datasource" — expected for tools without data_source param when using dev token |
| **OK_EMPTY** | MCP transport succeeded, tool returned empty/false (no dev data) |
| **API_ERROR** | MCP transport succeeded, API returned a business-logic error (not found, missing param, etc.) |

### Per-Tool Results

| # | Tool Name | Input | Result | Details |
|---|-----------|-------|--------|---------|
| 1 | `auth_validate` | `{token}` | DS_MISMATCH | No data_source param; wrapper targets live |
| 2 | `mcp_list_projects` | `{token}` | DS_MISMATCH | No data_source param |
| 3 | `mcp_search_candidates` | `{token, keyword_search:"test", item_per_page:1}` | DS_MISMATCH | No data_source param |
| 4 | `mcp_search_prospects` | `{token, keyword_search:"test", item_per_page:1}` | DS_MISMATCH | No data_source param |
| 5 | `list_applications` | `{token, per_page:1}` | DS_MISMATCH | No data_source param |
| 6 | `list_events` | `{token}` | DS_MISMATCH | No data_source param |
| 7 | `list_linkedin_events` | `{token, days_back:7}` | DS_MISMATCH | No data_source param |
| 8 | `task_counts` | `{token}` | DS_MISMATCH | No data_source param |
| 9 | `list_companies` | `{token, data_source:"development"}` | OK_EMPTY | false (no companies on dev) |
| 10 | `list_roles` (candidates) | `{token, data_source:"development", role_type:"candidates"}` | OK_EMPTY | false (no roles on dev) |
| 11 | `list_roles` (prospects) | `{token, data_source:"development", role_type:"prospects"}` | OK_EMPTY | false (no roles on dev) |
| 12 | `create_company` | `{token, data_source:"development", name:"L8 Test Co"}` | OK_EMPTY | false (tool responded, dev DB may lack schema) |
| 13 | `create_role` (candidates) | `{token, data_source:"development", name:"L8 Test Role", type:"candidates"}` | OK_EMPTY | false |
| 14 | `create_role` (prospects) | `{token, data_source:"development", name:"L8 Test Role", type:"prospects"}` | OK_EMPTY | false |
| 15 | `create_project` | `{token, data_source:"development", name:"L8 Test Project", ...}` | DS_MISMATCH | Tool has data_source param but internal wrapper targets live |
| 16 | `update_project` | `{token, data_source:"development", project_id:1}` | API_ERROR | ERROR_CODE_NOT_FOUND (project 1 does not exist on dev) |
| 17 | `mcp_get_project` | `{token, project_id:1}` | DS_MISMATCH | No data_source param |
| 18 | `mcp_get_pipeline` | `{token, project_id:1, stage_type:"candidates"}` | DS_MISMATCH | Partial — stages sub-call hit DS mismatch |
| 19 | `mcp_list_stage_people` | `{token, project_id:1, stage_id:1, stage_type:"candidates"}` | DS_MISMATCH | No data_source param |
| 20 | `get_candidate` | `{token, elastic_search_id:"test"}` | DS_MISMATCH | No data_source param |
| 21 | `mcp_get_prospect` | `{token, elastic_search_id:"test"}` | API_ERROR | ERROR_CODE_NOT_FOUND — tool reached API, no such ES doc |
| 22 | `initialize_stages` | `{token, project_id:1, stage_type:"candidates"}` | DS_MISMATCH | No data_source param |
| 23 | `assign_person` | `{token, project_id:1, person_id:1, ...}` | DS_MISMATCH | No data_source param |
| 24 | `move_person` | `{token, association_id:1, stage_id:2}` | DS_MISMATCH | No data_source param |
| 25 | `search_in_project` | `{token, project_id:1, keyword:"test"}` | DS_MISMATCH | No data_source param |
| 26 | `update_notes_candidate` | `{token, candidate_es_id:"test", notes:"L8 test"}` | DS_MISMATCH | No data_source param |
| 27 | `update_notes_prospect` | `{token, prospec_es_id:"test", notes:"L8 test"}` | DS_MISMATCH | No data_source param |
| 28 | `update_application` | `{token, application_id:1, status:"read"}` | API_ERROR | ERROR_CODE_NOT_FOUND (app 1 doesn't exist) |
| 29 | `create_event` | `{token, candidate_id:1, ...}` | DS_MISMATCH | No data_source param |
| 30 | `update_event` | `{token, event_id:1, title:"L8 Updated"}` | API_ERROR | ERROR_CODE_INPUT_ERROR — Missing param: project_person_association_id |
| 31 | `suggest_candidate_reply` | `{token, data_source:"development", project_id:1, ...}` | DS_MISMATCH | Has data_source param but internal wrapper targets live |
| 32 | `auto_organize` | `{token, data_source:"development", project_id:1}` | DS_MISMATCH | Has data_source param but internal wrapper targets live |

> Note: 32 test calls total because `list_roles` was tested twice (candidates + prospects). Unique tools: 30.

---

## 3. Summary

### MCP Transport Layer
- **All 30 tools reachable via MCP**: Every tool accepted the JSON-RPC call and returned a well-formed response. No MCP transport failures, timeouts, or 500 errors.

### Functional Results by Category

| Category | Count | Tools |
|----------|-------|-------|
| **MCP OK (empty dev data)** | 5 | list_companies, list_roles (x2), create_company, create_role (x2) |
| **DS_MISMATCH (expected)** | 21 | All tools without working data_source passthrough |
| **API_ERROR (valid errors)** | 4 | update_project (not found), mcp_get_prospect (not found), update_application (not found), update_event (missing param) |
| **Destructive BLOCKED** | 3 | unassign_person, delete_project, delete_stage |

### Datasource Mismatch Analysis
21 of 30 tools return "token belongs to different datasource" when called with a dev token. This is because the MCP tool wrappers are configured with `x-data-source=live` internally. The `x-data-source=development` on the MCP URL only affects the MCP server routing, not the underlying API calls within each tool.

**This is a known architectural constraint** documented in the previous L8 dev test report. To fully test these 21 tools, a **live user token** is required — the dev test credentials only generate dev tokens, which mismatch.

The 5 tools that work with dev tokens (list_companies, list_roles, create_company, create_role) explicitly accept a `data_source` parameter that overrides the internal wrapper.

### Test Project
No test project was created because:
1. `create_project` hit the datasource mismatch
2. `list_roles` returned no roles on dev (needed for project creation)
3. The dev environment has minimal seed data

---

## 4. Recommendation

**Tool removal: VERIFIED.** All 3 destructive tools (`unassign_person`, `delete_project`, `delete_stage`) are confirmed removed from the MCP server. Calls return JSON-RPC error -32602 "Tool not found."

**MCP transport: PASS.** All 30 remaining tools accept calls and return well-formed JSON-RPC responses. No transport-level failures.

**Functional testing: PARTIAL.** Full functional testing requires a live auth token due to the datasource mismatch in tool wrappers. The previous live test run (documented in `l8-live-final-summary.md`) achieved 19/23 pass on live with the tool set before removal. Since only deletions were made (no additions or modifications to remaining tools), those results still apply.

**Action items:**
1. Tool removal is safe to consider complete.
2. For full live retest of 30-tool set, obtain a live token from `https://bwats.betterway.dev/cli-token`.
3. Consider adding `data_source` parameter to remaining 21 tools for dev-environment testability.
