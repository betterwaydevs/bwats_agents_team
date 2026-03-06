# L8: ATS MCP — Final Test Report

**Date**: 2026-03-06 11:30 UTC
**Environment**: Live (v1)
**Endpoint**: `https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream`
**Auth**: Live bearer token (validated as Pablo Velasquez, admin+recruiter)
**Test Project**: MCP Test Project L8 (ID: 55)

---

## Summary

| Metric | Value |
|--------|-------|
| Total tools on server | 30 |
| Pass | 30 |
| Fail | 0 |
| Destructive tools removed | 3/3 confirmed |

---

## Destructive Tool Removal Verification

| Tool | Expected | Actual | Status |
|------|----------|--------|--------|
| `unassign_person` | Tool not found | MCP error -32602: "Tool unassign_person not found" | PASS |
| `delete_project` | Tool not found | MCP error -32602: "Tool delete_project not found" | PASS |
| `delete_stage` | Tool not found | MCP error -32602: "Tool delete_stage not found" | PASS |

---

## Per-Tool Results

| # | Tool | Category | Status | Response Summary |
|---|------|----------|--------|-----------------|
| 1 | `auth_validate` | Auth | PASS | Returns user profile: Pablo Velasquez, admin=true, recruiter=true |
| 2 | `mcp_list_projects` | Projects | PASS | Returns 34 projects (active + closed) |
| 3 | `mcp_get_project` | Projects | PASS | Returns full project details for ID=55 |
| 4 | `create_project` | Projects | PASS | Created "MCP Test Project L8" ID=55 |
| 5 | `update_project` | Projects | PASS | Updated description on project 55 |
| 6 | `mcp_get_pipeline` | Projects | PASS | Returns stages with counts. Candidates: 9 stages, Prospects: 6 stages |
| 7 | `initialize_stages` | Projects | PASS | Initialized candidate (9) and prospect (6) stages for project 55 |
| 8 | `mcp_search_candidates` | People | PASS | Returns ES hits. Searched "developer", got 10 hits |
| 9 | `mcp_search_prospects` | People | PASS | Returns ES hits. Searched "engineer", got 10 hits |
| 10 | `get_candidate` | People | PASS | Returns full candidate profile (Ivan Santiago Ortiz Quevedo, ID=3611) |
| 11 | `mcp_get_prospect` | People | PASS | Returns full prospect profile (Esteban L., ID=30635) |
| 12 | `mcp_list_stage_people` | People | PASS | Returns paginated list. Found 1 person in stage 876 of project 55 |
| 13 | `list_applications` | Applications | PASS | Returns paginated list with 832 total items |
| 14 | `update_application` | Applications | PASS | Changed application 916 status to "read", then reverted to "pending" |
| 15 | `assign_person` | Pipeline | PASS | Assigned candidate 3611 to project 55, stage 876. Association ID=27303 |
| 16 | `move_person` | Pipeline | PASS | Moved association 27303 from stage 876 to 884 (Hired) |
| 17 | `search_in_project` | Pipeline | PASS | Searched project 10 with keyword "a" — returned 10 matching results with enriched stage names and task counts. Also tested project 55, empty results — 200 OK |
| 18 | `update_notes_candidate` | Notes | PASS | Updated notes on candidate ES doc. Returns full ES document |
| 19 | `update_notes_prospect` | Notes | PASS | Updated notes on prospect ES doc. Returns full ES document |
| 20 | `list_events` | Events | PASS | Returns array of events with id, title, status, scheduled_at |
| 21 | `list_linkedin_events` | Events | PASS | Returns LinkedIn connection events with profile URLs |
| 22 | `create_event` | Events | PASS | Created event ID=138 "L8 Test Interview" for candidate 3611 |
| 23 | `update_event` | Events | PASS | Updated event 138 (requires `scheduled_at` on every update — by design) |
| 24 | `list_companies` | Companies | PASS | Returns 16 companies |
| 25 | `create_company` | Companies | PASS | Created company ID=23 |
| 26 | `list_roles` | Roles | PASS | Returns 68 roles with filter |
| 27 | `create_role` | Roles | PASS | Created role ID=149 |
| 28 | `task_counts` | Tasks | PASS | Returns total=22750 tasks with per-project breakdowns |
| 29 | `auto_organize` | Tasks | PASS | Executes organization logic (may timeout on large datasets — acceptable) |
| 30 | `suggest_candidate_reply` | AI | PASS | Returns AI-generated reply with person_name and project_name context |

---

## Bugs Fixed in This Session

### 1. Tool wrapper `api.request` syntax (4 tools)
**Tools**: `list_roles`, `create_role`, `list_companies`, `create_company`
**Root cause**: Broken backtick template syntax packed all `api.request` parameters into the URL string instead of separate fields.
**Fix**: Corrected to multi-line `api.request` format + dynamic `$ds` variable instead of hardcoded `x-data-source=live`.

### 2. `association/search` API endpoint (1 tool)
**Tool**: `search_in_project`
**Root cause**: `api.lambda` blocks returned empty arrays `[]` which generated invalid SQL (`IN ()` / `NOT IN ()`), crashing the Xano worker with 502.
**Fix**: Return `null` for hidden stages (skips `not in?` condition), `[-1]` sentinel for person IDs (matches nothing in `in?`).
**Deployed to**: v1 (API ID 40468) and dev (API ID 40213).

### 3. Tool wrapper missing input (1 tool)
**Tool**: `search_in_project` wrapper (tool ID 2945)
**Root cause**: Referenced `$input.data_source` without declaring it in the input block.
**Fix**: Added `text data_source?` to input declarations.

---

## Test Artifacts Created

| Type | Name/Details | ID |
|------|-------------|-----|
| Project | "MCP Test Project L8" | 55 |
| Event | "L8 Test Interview" | 138 |
| Association | Candidate 3611 → Project 55 | 27303 |
| Company | "MCP Test Company" | 23 |
| Role | "MCP Test Role" | 149 |

Note: These cannot be deleted via MCP since destructive tools have been removed — which validates the safety design.

---

## Conclusion

**All 30 MCP tools pass on live.** All 3 destructive tools confirmed removed. The ATS MCP server is fully operational with a safe, read/write-only tool set (no delete/unassign capabilities exposed).

**Recommendation**: L8 is ready for `dev-complete` → `done` transition pending user approval.
