# L8: ATS MCP Migration — Progress Log

## 2026-03-05 — Session Update

### Status
- Phase 1A: DONE (23/23 tools created in `v1` and exposed on server 594)
- Phase 1B: DONE (MCP connectivity verified)
- Phase 1C: BLOCKED (waiting for live user token)
- Phase 2: DONE (skill updated for MCP dual-mode + api-mcp reference added)
- Phase 3: BLOCKED (waiting for live user token for final test + upload)

### Completed Work
1. Initialized Xano Metadata MCP session and verified connectivity.
2. Confirmed 13 pre-existing tools in `v1`.
3. Created 10 missing tools:
   - `update_application`, `update_notes_candidate`, `update_notes_prospect`, `move_person`, `assign_person`, `create_event`, `update_event`, `create_project`, `initialize_stages`, `search_in_project`.
4. Updated MCP server `594` (`BWATS_ATS`) tool list to include all 23 tools.
5. Verified BWATS_ATS endpoint `tools/list` returns 23 tools.
6. Updated `.claude/skills/ats/SKILL.md` to MCP-first dual-mode behavior.
7. Added `.claude/skills/ats/references/api-mcp.md` with all 23 tool signatures.

### Blocker
- Live user bearer token required for:
  - Phase 1C: execute all 23 tools with real auth and document outcomes.
  - Phase 3: upload skill package to `api:3Bq6OWvc/tools/upload`.
- Attempted login with local stored test creds failed with `403 Invalid Credentials` on live.

### Next Action Once Token Is Provided
1. Run and log 23 tool calls against `https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream`.
2. Build zip of `.claude/skills/ats/` with `SKILL.md` at zip root.
3. Upload skill `ats-cli-skill` version `1.1.0` (Authorization header only).

## 2026-03-05 — Dev Branch Push + Full Test Report

### Dev Push Completed
- Mirrored missing tools to `development` branch.
- Confirmed all 23 L8 tool names exist in development.
- Updated MCP server `602` (`BWATS_ATS`) with full 23-tool list.

### Full Dev Test Executed
- Ran all 23 tools through MCP and generated report:
  - `features/reports/L8/l8-dev-mcp-test-report.md`
- MCP transport and invocation layer worked for all 23 calls.
- Functional responses mostly returned datasource mismatch (`token belongs to different datasource`) because wrappers are configured with `x-data-source=live`.

## 2026-03-05 — Live Final Attempt (Remaining v1 Tool Fixes)

### Scope
- `assign_person` (2941)
- `move_person` (2940)
- `search_in_project` (2945)
- `update_event` (2943)

### Status
- Blocked in this runtime by network/DNS:
  - `curl: (6) Could not resolve host: xano.atlanticsoft.co`
- Live metadata inspection/update and live MCP retest could not run from this environment.

### Prepared Artifacts
- `/tmp/l8_live_final/patch_v1_tools.sh`
- `/tmp/l8_live_final/run_targeted_retest.sh`
- `/tmp/l8_live_final/run_full_strict.sh`
- `/tmp/l8_live_final/tools/2941_assign_person.xs`
- `/tmp/l8_live_final/tools/2940_move_person.xs`
- `/tmp/l8_live_final/tools/2945_search_in_project.xs`
- `/tmp/l8_live_final/tools/2943_update_event.xs`
- `/tmp/l8_live_final/status.json`
- `features/reports/L8/l8-live-final-summary.md`

### Pending Once DNS/Network Restores
1. Run `/tmp/l8_live_final/patch_v1_tools.sh`.
2. Run `/tmp/l8_live_final/run_targeted_retest.sh`.
3. Run `/tmp/l8_live_final/run_full_strict.sh`.

## 2026-03-05 — Live Retest Executed (Network Restored)

### Completed
1. Ran `/tmp/l8_live_final/patch_v1_tools.sh` against `v1`.
2. Ran targeted retest for previous 4 failures.
3. Ran full strict 23-tool suite.

### Targeted Retest Result (4/4 pass)
- `assign_person`: pass
- `move_person`: pass
- `search_in_project`: pass
- `update_event`: pass

### Full Strict Result
- Total: 23
- Pass: 19
- Fail: 4

Remaining strict failures were due to test-seed/data-path behavior (`task_counts=false`, missing prospect seed, and one upstream 502), not MCP parser failures in patched write tools.

### Report
- `features/reports/L8/l8-live-final-summary.md`

## 2026-03-05 — Phase 3 Skill Upload Completed

- Built zip from `.claude/skills/ats/` with `SKILL.md` at zip root:
  - `/tmp/ats-cli-skill-1.1.0.zip`
- Uploaded to live endpoint:
  - `POST https://xano.atlanticsoft.co/api:3Bq6OWvc/tools/upload?x-data-source=live`
- Upload payload:
  - `slug=ats-cli-skill`
  - `version=1.1.0`
  - `file=@/tmp/ats-cli-skill-1.1.0.zip`
- Response confirms:
  - `slug: ats-cli-skill`
  - `current_version: 1.1.0`
  - `download_url: /vault/0WsR7srI/hWQxvAD0K0YmTPmNcwbjxt-CD38/3AohZA../ats-cli-skill-1.1.0.zip`

## 2026-03-05 — ATS Skill Repackage + MCP Setup PDF (v1.1.1)

- Added MCP setup documentation artifacts:
  - `.claude/skills/ats/references/mcp-setup-guide.md`
  - `.claude/skills/ats/references/mcp-setup-guide.pdf`
- Built updated package:
  - `/tmp/ats-cli-skill-1.1.1.zip`
- Uploaded to live endpoint:
  - `POST https://xano.atlanticsoft.co/api:3Bq6OWvc/tools/upload?x-data-source=live`
- Upload payload:
  - `slug=ats-cli-skill`
  - `version=1.1.1`
  - `file=@/tmp/ats-cli-skill-1.1.1.zip`
- Response confirms:
  - `current_version: 1.1.1`
  - `download_url: /vault/0WsR7srI/GIl-_FmtaqucKH9RIDjzTIEETR4/VYkjMA../ats-cli-skill-1.1.1.zip`

## 2026-03-06 — Destructive Tool Removal + Full Live Test + Bug Fixes

### Destructive Tools Removed
- Removed `unassign_person`, `delete_project`, `delete_stage` from ATS MCP server (Sk3cINn0)
- MCP server is branch-independent — one update covers both v1 and dev
- Verified: all 3 return JSON-RPC -32602 "Tool not found"
- Tool count: 33 → 30

### Tool Wrapper Fixes (4 tools)
- `list_roles` (2967), `create_role` (2968), `list_companies` (2969), `create_company` (2970)
- Root cause: broken backtick `api.request` syntax packing all params into URL string
- Fixed: proper multi-line `api.request` format + dynamic `$ds` variable instead of hardcoded `x-data-source=live`
- All 4 retested and PASS

### search_in_project API Fix
- MCP tool wrapper (2945) was also fixed (missing `data_source` input declaration)
- Underlying API endpoint `POST /association/search` (v1: 40468, dev: 40213) crashed with 502 on non-empty keywords
- Root cause: `api.lambda` returned `[]` which generated invalid SQL (`IN ()` / `NOT IN ()`)
- Fix: return `null` for hidden stages (skips condition), `[-1]` sentinel for person IDs (matches nothing)
- Deployed to both v1 and dev. Tested with multiple projects — all 200 OK

### Full Live Test Results
- 30/30 tools PASS (after fixes)
- 3/3 destructive tools confirmed removed
- Test artifacts: Project ID 55, Event ID 138, Association ID 27303
- Report: `features/reports/L8/l8-live-mcp-full-test-report.md`

### MCP updateAPI Works from Curl
- Previously thought "MCP getAPI/updateAPI intermittently broken" — actually it just needs `apigroup_id` parameter
- With all 3 params (`workspace_id`, `apigroup_id`, `api_id`), works fine from curl
