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

## How to Add Learnings

Append new entries to the appropriate category using this format:
```markdown
### Brief Title
- **Issue**: What the problem or discovery is
- **Solution**: How to fix or handle it
- **Date**: YYYY-MM-DD
```
