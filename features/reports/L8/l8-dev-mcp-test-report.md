# L8 Dev MCP Test Report

Date: 2026-03-05  
Environment: development branch (`server 602`)  
MCP URL: `https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream`

## Scope
- Verified all 23 ATS MCP tools are present on development branch and attached to MCP server 602.
- Executed all 23 tools through MCP.

## Summary
- Total tools executed: 23
- MCP transport failures: 0
- Tool invocation failures at MCP layer: 0
- Business-level responses include datasource/auth and payload errors for multiple tools (details below).

## Important Finding
Most tools returned:
- `ERROR_CODE_UNAUTHORIZED: This token belongs to a different datasource.`

This indicates a datasource mismatch during test execution (tool wrappers call endpoints with `x-data-source=live`, while this run used a development-auth user token).

## Per-Tool Results

| Tool | MCP Call | Note | API Response Summary |
|---|---|---|---|
| `auth_validate` | PASS | validate token | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `list_applications` | PASS | pending applications | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `list_events` | PASS | pending events | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `list_linkedin_events` | PASS | last 7 days | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `task_counts` | PASS | task summary | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `mcp_list_projects` | PASS | active projects | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `mcp_get_project` | PASS | project details | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `mcp_get_pipeline` | PASS | pipeline prospects | `ok` |
| `mcp_list_stage_people` | PASS | stage people | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `mcp_search_candidates` | PASS | global candidate search | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `mcp_search_prospects` | PASS | global prospect search | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `get_candidate` | PASS | candidate detail | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `mcp_get_prospect` | PASS | prospect detail | `{"code":"ERROR_CODE_NOT_FOUND","message":"Not Found"}` |
| `update_application` | PASS | set application read | `{"code":"ERROR_CODE_NOT_FOUND","message":""}` |
| `update_notes_candidate` | PASS | candidate note update | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `update_notes_prospect` | PASS | prospect note update | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `move_person` | PASS | move association | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `assign_person` | PASS | assign person | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `create_event` | PASS | create event | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `update_event` | PASS | complete event | `{"code":"ERROR_FATAL","message":"Error parsing JSON: Syntax error"}` |
| `create_project` | PASS | create project | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `initialize_stages` | PASS | initialize stages | `{"code":"ERROR_CODE_UNAUTHORIZED","message":"This token belongs to a different datasource."}` |
| `search_in_project` | PASS | search in project | `{"code":"ERROR_FATAL","message":"Error parsing JSON: Syntax error"}` |

## Dev Push Verification
- Development branch now contains all 23 tools.
- Server `602` (`BWATS_ATS`) updated with the full 23-tool list.

## Next Step to Achieve Green Functional Validation
Run the same 23-tool test matrix with a valid **live CLI token** from `https://bwats.betterway.dev/cli-token` (because current wrappers target `x-data-source=live`).
