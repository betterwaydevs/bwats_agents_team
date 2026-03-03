# QF7: Sweep function.call to function.run for v1 Compatibility

**Status**: Local files updated -- awaiting deployment to Xano
**Date**: 2026-03-02

## Background

In Xano, `function.call` uses GUID-based resolution. When functions are merged from dev to v1, they get different GUIDs on each branch. This means `function.call` silently fails on v1 -- the API returns "success" without actually executing the function.

`function.run` uses name-based resolution and works correctly across both branches.

## Summary

- **Total .xs source files with `function.call`**: 34 files
- **Total `function.call` occurrences changed to `function.run`**: 113 occurrences
- **Exceptions (NOT changed)**: 0 -- all should use `function.run`

## Complete Inventory of Changes

### Tools (22 files, 26 occurrences)

| File | Occurrences | Functions Called |
|------|-------------|-----------------|
| `tools/1053_get_all_person_data.xs` | 8 | persons/get_person, associations/get_person_activity_history, touchpoint/get_touchpoints, associations/get_person_project_associations, persons/get_person_events, persons/get_person_videoask, persons/get_person_linkedin_associations, persons/get_person_applications |
| `tools/42_search_candidates_in_es.xs` | 1 | search_candidates_in_es |
| `tools/254_create_stage.xs` | 1 | associations/create_stage |
| `tools/53_get_person_videoask.xs` | 1 | persons/get_person_videoask |
| `tools/44_get_project.xs` | 1 | projects/project_project_id |
| `tools/266_get_role_by_id.xs` | 1 | get_role_by_id |
| `tools/265_pending_tasks_per_person.xs` | 1 | tasks/pending_tasks_per_person |
| `tools/58_create_touchpoint.xs` | 1 | touchpoint/touchpoint_create |
| `tools/49_change_person_project_association_stage_info.xs` | 1 | associations/change_person_project_association_stage_info |
| `tools/272_tasks_create_linked_in_special_outreach_task.xs` | 1 | tasks/create_linked_in_special_outreach_task |
| `tools/268_get_project_stages_by_id.xs` | 1 | get_project_stages_by_id |
| `tools/270_get_users.xs` | 1 | get_users |
| `tools/267_get_active_projects.xs` | 1 | associations/get_active_projects |
| `tools/50_persons_get_person_applications.xs` | 1 | persons/get_person_applications |
| `tools/52_get_person_linkedin_associations.xs` | 1 | persons/get_person_linkedin_associations |
| `tools/45_get_person.xs` | 1 | persons/get_person |
| `tools/47_get_touchpoints.xs` | 1 | touchpoint/get_touchpoints |
| `tools/252_task_types.xs` | 1 | task_types |
| `tools/46_get_person_activity_history.xs` | 1 | associations/get_person_activity_history |
| `tools/48_get_person_project_associations.xs` | 1 | associations/get_person_project_associations |
| `tools/51_get_person_events.xs` | 1 | persons/get_person_events |
| `tools/827_create_person_to_project_association.xs` | 1 | create_person_to_project_association |
| `tools/269_create_task.xs` | 1 | tasks/create_task |

### Functions (9 files, 25 occurrences)

| File | Occurrences | Functions Called |
|------|-------------|-----------------|
| `functions/persons/10826_get_all_person_data.xs` | 8 | persons/get_person, associations/get_person_activity_history, touchpoint/get_touchpoints, associations/get_person_project_associations, persons/get_person_events, persons/get_person_videoask, persons/get_person_linkedin_associations, persons/get_person_applications |
| `functions/coresignal/2430_enrich_contact_core_signal.xs` | 1 | util/normalize_linked_url |
| `functions/communications/2396_send_email_message.xs` | 2 | communications/enqueue_email, communications/process_email |
| `functions/communications/10568_process_email.xs` | 2 | communications/resend_email_wrapper, touchpoint/touchpoint_create |
| `functions/test/2436_test_touchpoint_create.xs` | 1 | touchpoint/touchpoint_create |
| `functions/11189_parse_unparsed_prospect.xs` | 6 | call_open_ia, elastic_search/document (x3), prospect_quick_normalize_skills, agents/call_prospect_router |
| `functions/agents/9395_call_recruiter_assistant.xs` | 1 | tasks/create_task |
| `functions/agents/8049_call_prospect_router.xs` | 1 | tasks/create_task |
| `functions/agents/9394_call_score_agent.xs` | 1 | persons/get_all_person_data |

### API Endpoints (12 files, 58 occurrences)

| File | Occurrences | Functions Called |
|------|-------------|-----------------|
| `apis/test_utils/17009_test_POST.xs` | 23 | util/convert_docx_to_pdf, coresignal/enrich_contact_core_signal, persons/get_person_events, persons/get_person_videoask, persons/get_person_linkedin_associations, persons/get_person_applications, agents/call_touchpoints_agent, persons/get_person, associations/get_person_project_associations, associations/get_active_projects, get_project_stages_by_id, tasks/pending_tasks_per_person, tasks/create_task, associations/change_person_project_association_stage_info, associations/create_stage, associations/get_person_activity_history, touchpoint/get_touchpoints |
| `apis/messaging/42554_webhook_resend_inbound_POST.xs` | 2 | touchpoint/touchpoint_create, communications/process_email_event |
| `apis/messaging/42561_inbox_inbound_email_id_reply_POST.xs` | 2 | communications/resend_email_wrapper, touchpoint/touchpoint_create |
| `apis/messaging/16971_messaging_send_email_POST.xs` | 2 | communications/enqueue_email, communications/process_email |
| `apis/prospects/16891_create_prospect_from_html_POST.xs` | 1 | parse_unparsed_prospect |
| `apis/auto_agents/19962_prospect_router_POST.xs` | 1 | agents/call_prospect_router |
| `apis/auto_agents/17007_tests_test_Prospects_and_Candidates_Project_Scorer_GET.xs` | 6 | projects/project_project_id, persons/get_person, associations/get_person_activity_history, touchpoint/get_touchpoints, associations/get_person_project_associations, persons/get_all_person_data |
| `apis/auto_agents/40725_call_recruiter_assistant_update_person_from_linkedin_conversation_POST.xs` | 5 | create_person_to_project_association, touchpoint/touchpoint_create, tasks/create_task, agents/call_recruiter_assistant |
| `apis/auto_agents/19963_tests_test_router_agent_POST.xs` | 9 | persons/get_person, associations/get_person_project_associations, associations/get_active_projects, get_project_stages_by_id, tasks/pending_tasks_per_person, tasks/create_task, associations/change_person_project_association_stage_info, associations/create_stage |
| `apis/auto_agents/19968_prospect_router_new_prospect_POST.xs` | 1 | agents/call_prospect_router |
| `apis/auto_agents/17008_call_Prospects_and_Candidates_Project_Scorer_POST.xs` | 1 | persons/get_all_person_data |
| `apis/auto_agents/19966_call_recruiter_assistant_POST.xs` | 1 | tasks/create_task |

### Tasks (2 files, 2 occurrences)

| File | Occurrences | Functions Called |
|------|-------------|-----------------|
| `tasks/254_auto_route_agent.xs` | 1 | agents/call_prospect_router |
| `tasks/498_process_email_queue.xs` | 1 | communications/process_email |

## Files NOT Changed (and why)

### Requirements/Planning docs (not deployed to Xano)
- `requirements/` -- planning documents, not actual XanoScript
- `requirements/planned agents/` -- drafts, not deployed
- `LEARNINGS.md` -- documentation references only
- `tests/score_agent.hurl` -- test comment only
- `requirements/router_agent_session_transcript.jsonl` -- session log
- `node_modules/` -- third-party code

These files mention `function.call` in documentation/planning context only and are NOT deployed to Xano. No changes needed.

## Unique Functions Referenced (deduplicated)

All unique function names that were being called via `function.call` (now `function.run`):

1. `persons/get_person`
2. `persons/get_person_events`
3. `persons/get_person_videoask`
4. `persons/get_person_linkedin_associations`
5. `persons/get_person_applications`
6. `persons/get_all_person_data`
7. `associations/get_person_activity_history`
8. `associations/get_person_project_associations`
9. `associations/get_active_projects`
10. `associations/change_person_project_association_stage_info`
11. `associations/create_stage`
12. `touchpoint/get_touchpoints`
13. `touchpoint/touchpoint_create`
14. `tasks/pending_tasks_per_person`
15. `tasks/create_task`
16. `tasks/create_linked_in_special_outreach_task`
17. `projects/project_project_id`
18. `agents/call_prospect_router`
19. `agents/call_recruiter_assistant`
20. `agents/call_touchpoints_agent`
21. `communications/enqueue_email`
22. `communications/process_email`
23. `communications/process_email_event`
24. `communications/resend_email_wrapper`
25. `coresignal/enrich_contact_core_signal`
26. `elastic_search/document`
27. `util/convert_docx_to_pdf`
28. `util/normalize_linked_url`
29. `call_open_ia` (root-level)
30. `search_candidates_in_es` (root-level)
31. `get_role_by_id` (root-level)
32. `get_project_stages_by_id` (root-level)
33. `get_users` (root-level)
34. `task_types` (root-level)
35. `create_person_to_project_association` (root-level)
36. `parse_unparsed_prospect` (root-level)
37. `prospect_quick_normalize_skills` (root-level)

## Deployment Instructions

The local .xs files have been updated. To deploy to Xano:

### Option A: Push via MCP (Recommended)
1. Use the `push_all_changes_to_xano` MCP tool to push all modified files at once
2. The MCP will validate XanoScript syntax on push
3. Push to **dev branch first**, test, then merge to v1

### Option B: Manual update via Xano UI
1. For each file listed above, open the corresponding endpoint/function/task in the Xano UI
2. Find each `function.call` statement and change it to `function.run`
3. The syntax is identical -- only the keyword changes
4. Save and publish

### Option C: Per-file MCP update
1. Use `mcp__xano__updateAPI` / `mcp__xano__updateFunction` / `mcp__xano__updateTask` for each file
2. Pass the updated XanoScript content
3. This is the most granular approach but requires knowing each file's API/function/task ID

### Important Notes
- `function.run` is a drop-in replacement for `function.call` -- same syntax, same parameters, same `as` bindings
- The only difference: `function.run` uses name-based resolution (works across branches), `function.call` uses GUID-based resolution (breaks on v1 for merged functions)
- **Test on dev first** before deploying to v1
- Comments that referenced `function.call` behavior were also updated for consistency
