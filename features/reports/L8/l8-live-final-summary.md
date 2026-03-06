# L8 Live Final Summary (Backend MCP v1)

Last Verified: 2026-03-05 17:00:53 UTC (2026-03-05 12:00:53 -05)
Workspace: 6
Branch: v1
Endpoint: https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream

## Final Status

Connectivity restored. Live MCP patch + retest executed.

### 1) v1 Patch Applied

Patched tools on live v1:
- `2941` assign_person
- `2940` move_person
- `2945` search_in_project
- `2943` update_event

Command:
- `/tmp/l8_live_final/patch_v1_tools.sh`

### 2) Targeted Retest (previous 4 failing tools)

Command:
- `/tmp/l8_live_final/run_targeted_retest.sh`

Result:
- `assign_person`: PASS
- `move_person`: PASS
- `search_in_project`: PASS
- `update_event`: PASS

Notes:
- `update_event` required passing `project_person_association_id` and `scheduled_at` in the update payload for this backend validation path.

### 3) Full Strict 23-Tool Suite

Command:
- `/tmp/l8_live_final/run_full_strict.sh`

Result summary:
- Total: 23
- Pass: 19
- Fail: 4

Remaining 4 failures in strict run:
1. `task_counts`: returned `false` (non-object payload for current token/data)
2. `assign_person`: strict harness had no prospect seed (`missing prospect id/es`)
3. `move_person`: dependent on `assign_person` in strict harness
4. `search_in_project`: strict run got upstream HTML `502 Bad Gateway` response

Interpretation:
- The 4 originally failing MCP write tools were specifically retested and all passed in targeted flow.
- Remaining strict failures are environment/data-path issues in the generic full harness, not parser failures in the patched tools.

## Proof Artifacts

Targeted run:
- `/tmp/l8_targeted/assign_person.json`
- `/tmp/l8_targeted/move_person.json`
- `/tmp/l8_targeted/search_in_project.json`
- `/tmp/l8_targeted/update_event.json`

Full strict run:
- `/tmp/l8_live_v2/summary.json`
- `/tmp/l8_live_v2/results.ndjson`
- `/tmp/l8_live_v2/raw/`

Dashboard-friendly copied proofs:
- `features/reports/L8/proof/live-2026-03-05/01-mcp_list_projects.json`
- `features/reports/L8/proof/live-2026-03-05/02-mcp_list_stage_people.json`
- `features/reports/L8/proof/live-2026-03-05/03-assign_person.json`
- `features/reports/L8/proof/live-2026-03-05/04-move_person.json`
- `features/reports/L8/proof/live-2026-03-05/05-search_in_project.json`
- `features/reports/L8/proof/live-2026-03-05/06-update_event.json`
- `features/reports/L8/proof/live-2026-03-05/07-full-summary.json`
