# Team Orchestrator Learnings

Discovered patterns, gotchas, and best practices for the team orchestrator (the main Claude instance running from `team/`).

**Scope**: Only record learnings relevant to orchestration — agent coordination, permissions, team workflows, cross-project issues, and Claude Code configuration. Project-specific learnings (XanoScript, React, etc.) belong in their respective project's LEARNINGS.md.

---

## Permissions & Agent Configuration

### File permission patterns must include absolute paths
- **Issue**: Agents running in "don't ask" mode use absolute paths for file tools (Edit, Write, Glob), but `settings.local.json` only had relative patterns (`../**`). This caused `Edit` permission denials.
- **Solution**: Every file tool permission needs BOTH relative (`../**`) and absolute (`/home/pablo/projects/bwats/**`) patterns in `settings.local.json`.
- **Date**: 2026-02-26

### Xano MCP config belongs in bwats_xano only
- **Issue**: Having `.mcp.json` and `.env` (with XANO_TOKEN) at the team level was redundant — all Xano work is delegated to the `backend-developer` agent working from `bwats_xano/`.
- **Solution**: Removed `.env` symlink, `.mcp.json`, and all `mcp__xano__*` permissions from `team/`. Xano credentials and MCP config live exclusively in `../bwats_xano/`.
- **Date**: 2026-02-26

### CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS is required for teams
- **Issue**: Removed the `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` setting from `settings.local.json` during MCP cleanup, thinking it was MCP-related. It's actually the flag that enables agent teams (TeamCreate, SendMessage, teammate coordination).
- **Solution**: Always keep `"env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }` in `settings.local.json`. It's independent of MCP.
- **Date**: 2026-02-26

---

### Curl to Xano dev branch requires X-Data-Source header and proper escaping
- **Issue**: Calling Xano development endpoints from the orchestrator via curl failed for two reasons: (1) passwords containing `$` get interpreted by the shell, and (2) the `X-Data-Source: development` header is required for dev branch authentication.
- **Solution**: Use `jq -n` to build JSON payloads (handles special chars), read env vars with `grep | cut` instead of `source`, and always include `-H "X-Data-Source: development"`. See `bwats_xano/LEARNINGS.md` entry "X-Data-Source Header Required" for full details.
- **Date**: 2026-02-27

### Xano MCP "Invalid token" is an SSE transport bug, not token expiration
- **Issue**: MCP tool calls returned "Invalid token" even though the `XANO_TOKEN` was valid and set to never expire. We kept thinking the token had expired and needed regeneration.
- **Solution**: Switch `.mcp.json` from `"type": "sse"` with `/sse` URL to `"type": "streamable-http"` with `/stream` URL. The Xano Metadata API token does NOT expire when created with "never expire" — the SSE transport has an authentication bug on tool calls.
- **Date**: 2026-02-27

---

### Always test user-reported bugs on live, not dev
- **Issue**: Fixed P4 profile bug and tested on dev server, but the specific person (Juliano) only exists in the live database. Dev tests passed but the fix couldn't be validated against the actual broken URL.
- **Solution**: Use `http://pablo-home-linux.tailf79837.ts.net:8080/` for live testing. Dev credentials don't work on live — ask Pablo for live credentials at session start. When a user reports a specific broken URL, always test that exact URL on live.
- **Date**: 2026-02-27

### Every task must be tested end-to-end before delivery
- **Issue**: Multiple tasks (Tailscale IPs, P4 profile fix) were declared "done" without verifying the actual output. The Tailscale integration had a response-path bug (`resp.response.devices` instead of `resp.response.result.devices`) that returned empty data — but no one tested the real API response. The P4 fix was tested on dev where the broken record didn't exist. In both cases, the screenshots showed broken/incomplete results but were treated as passing.
- **Solution**: The PM (orchestrator) must enforce a strict delivery checklist: (1) Call the actual API endpoint and verify the response data is correct, (2) Run Playwright tests and visually inspect screenshots — don't just check pass/fail, (3) For user-reported bugs, test the exact URL on live, (4) For API integrations, verify the real external API returns data before testing the frontend. Never mark a task done until the report screenshot proves the feature works with real data.
- **Date**: 2026-02-27

### XanoScript timestamp inputs must be nullable for optional filter params
- **Issue**: Deployed `touchpoint_after` and `touchpoint_before` as `timestamp touchpoint_after?` (optional but NOT nullable). With `nullable: false`, Xano coerces the missing value to a default (likely `0` epoch) instead of `null`. In the lambda, the truthiness check `if (touchpoint_after_filter || touchpoint_before_filter)` could behave unpredictably because `0` is falsy but other coerced defaults might not be. The filters appeared to be silently ignored.
- **Solution**: Use `timestamp? touchpoint_after?` (nullable type + optional field) so that when the input is omitted, it is truly `null` in the lambda. The `?` on the type = nullable, the `?` on the field name = optional. Also, always re-publish via `updateAPI` with `publish: true` after changes to force a function stack recompile.
- **Date**: 2026-02-27

---

## Team Coordination

### Orchestrator must delegate, never implement
- **Issue**: The orchestrator was reading files, writing code, and running TypeScript checks directly — consuming context on implementation details instead of preserving it for coordination and tracking. Even "simple" single-file tasks were handled inline, causing context to fill up with code rather than task status.
- **Solution**: The orchestrator NEVER executes implementation work (no Edit, no Write to code files, no running builds/tests). Every task — even a single-file change — gets delegated to the appropriate subagent via `Task` tool (doesn't require `TeamCreate`). The orchestrator's job is: (1) understand the request, (2) delegate with clear instructions, (3) track results, (4) report back to the user. This keeps orchestrator context focused on coordination.
- **Date**: 2026-02-27

---

## Cross-Project Workflow

_(Add entries as patterns are discovered)_

---

### Xano MCP Requires Stateful Session (Initialize First)
- **Issue**: Calling MCP `tools/call` directly without initialization returns "Bad Request: Server not initialized". The MCP stream requires an `initialize` call first to establish a session and obtain an `mcp-session-id` header.
- **Solution**: Two-step process: (1) POST `initialize` to get session ID from `mcp-session-id` response header, (2) Include `mcp-session-id: {id}` header in all subsequent `tools/call` requests. Session is stateful and valid for the duration of the HTTP connection.
- **Date**: 2026-02-28

### Xano MCP addTableContent/deleteAPI Returns Access Denied
- **Issue**: The MCP token (with `workspace:database: 7`) cannot use `addTableContent` or `deleteAPI` tools via the MCP stream even with full scopes. These operations are blocked regardless of token scope.
- **Solution**: For table content inserts, create a temporary public API endpoint in `test_utils` group that does the db.add, call it once via curl, then note the endpoint for manual cleanup (deleteAPI is also blocked). For API deletes, do them manually via the Xano web UI.
- **Date**: 2026-02-28

### MCP getTableContent Reads Live Data Not Dev
- **Issue**: `getTableContent` MCP tool returns records from the live database, not the development datasource, even when `branch: "development"` is specified. This caused email_queue to appear empty when it had 3 pending records in dev.
- **Solution**: To verify data on the dev branch, use the Xano application API with `X-Data-Source: development` header rather than the MCP `getTableContent` tool. The app API respects the datasource header; the MCP tool does not.
- **Date**: 2026-02-28

---

## API & Backend Verification

### XanoScript: itemsTotal vs items.length After Post-Query Filtering
- **Issue**: When filtering in a `api.lambda` (JavaScript) after the Xano pagination query, `itemsTotal` reflects the pre-filter DB count. `items.length` / `itemsReceived` reflect the actual filtered count. When verifying filters via curl, check `items.length`, NOT `itemsTotal`.
- **Solution**: Always check `.items.length` (or `.itemsReceived`) in curl tests. The `itemsTotal` is set by Xano's paginated query before the lambda runs.
- **Date**: 2026-02-27

### Xano API Canonical: `_dY_2A8p` is Association (NOT `UVhvxoOh`)
- **Issue**: CLAUDE.md and multiple agent prompts incorrectly list `UVhvxoOh` as the association API canonical. This canonical does NOT exist on any Xano branch. The correct canonical for the association group is `_dY_2A8p`.
- **Solution**: Use `_dY_2A8p` for all association API calls. The `UVhvxoOh` canonical in docs is a phantom — needs cleanup.
- **Date**: 2026-02-27

### Playwright Screenshots: Login Credentials & Grid Selectors
- **Issue**: Login password is `$123456` (from `bwats_xano/.env`), not `betterway1`. Grid defaults to "Pre Selected" tab (9 rows), not "All Stages" (24+ rows). Need to click "All Stages" tab to see full dataset.
- **Solution**: Read credentials from `bwats_xano/.env`. After navigating to grid, click `button[role="tab"]:has-text("All Stages")` to show all people.
- **Date**: 2026-02-27

### Team agents spawned from team/ cannot use Xano MCP
- **Issue**: The backend-developer agent, when spawned as a teammate from the `team/` directory, does not have MCP access. MCP connections are established at session startup based on the `.mcp.json` in the working directory. Since `team/` has no `.mcp.json`, spawned teammates inherit no MCP. The agent got stuck trying to use MCP tools that didn't exist.
- **Solution**: For tasks requiring Xano MCP, either: (1) Use tier-2 subagents defined in `bwats_xano/.claude/agents/prompts/` which are designed to work from that directory, or (2) Have the backend-developer agent work purely via curl/REST API without MCP, or (3) Run a separate Claude Code session from `bwats_xano/` directory for MCP-dependent investigations.
- **Date**: 2026-03-01

### XANO_TOKEN is admin-only (audience: xano:meta), not for REST API auth
- **Issue**: Tried to use `XANO_TOKEN` (service account JWT) as a Bearer token for REST API calls. Returns "Invalid token" on all data sources. The token's audience is `xano:meta` — it's designed for the Xano Metadata API (MCP), NOT for application API endpoints.
- **Solution**: For REST API auth, always login via `POST /api:Ks58d17q/auth/login` to get a user JWE token. Dev credentials only work with `?x-data-source=development`. Live credentials must be obtained from Pablo separately.
- **Date**: 2026-03-01

### XanoScript `first_notnull` filter throws "Not numeric" on text fields
- **Issue**: The `|first_notnull:""` pipe filter in XanoScript throws `{"code":"ERROR_FATAL","message":"Not numeric."}` when applied to text fields (like `first_name`, `last_name`, `headline_role`) on the development data source. The filter internally attempts a numeric conversion before the null check, which fails on string values. This caused the M10 `suggest_reply` endpoint to crash after a successful person lookup.
- **Solution**: Replace `$value|first_notnull:""` with JavaScript null coalescing in an `api.lambda` block: `return $var.person.field_name || '';`. This is functionally identical but avoids the internal type coercion bug. Also discovered: `updateAPI` via MCP publishes to the default branch (v1) only — use the correct `apigroup_id` (not `appId` from workspace context) and the correct `api_id` (listed under the API group, not from the workspace-level queries list).
- **Date**: 2026-03-01

### MCP updateAPI uses default branch (v1), not development
- **Issue**: The `updateAPI` MCP tool does NOT accept a `branch` parameter. All updates go to the default branch (v1). When testing on `?x-data-source=development`, the development branch's CODE runs, not v1's. Debug modifications to v1 had no effect on dev testing.
- **Solution**: To update the development branch's API code, you need to either (1) merge v1 to development, or (2) use a branch-specific mechanism. The `X-Branch: development` header on MCP requests did NOT reliably target the development branch. For testing fixes, publish to v1, then verify on v1 (which requires live credentials), or ask the user to merge v1 to development via the Xano UI.
- **Date**: 2026-03-01

## How to Add Learnings

Append new entries to the appropriate category using this format:
```markdown
### Brief Title
- **Issue**: What the problem or discovery is
- **Solution**: How to fix or handle it
- **Date**: YYYY-MM-DD
```
