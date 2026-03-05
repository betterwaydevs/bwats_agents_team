# BWATS_ATS MCP Tool Reference

Server URL: `https://xano.atlanticsoft.co/x2/mcp/Sk3cINn0/mcp/stream`

All tools return the underlying API result (`$api_result.response.result`).
All tools require `token` unless noted.

## Read Tools (13)

1. `auth_validate(token)`
- Validates user token and returns user profile.

2. `list_applications(token, status?, page?, per_page?, keyword?)`
- Lists applications (paginated).

3. `list_events(token, status?)`
- Lists candidate events.

4. `list_linkedin_events(token, timestamp?)`
- Lists LinkedIn events after timestamp.

5. `task_counts(token)`
- Returns task counts by project/status.

6. `get_candidate(token, elastic_search_id)`
- Returns full candidate profile.

7. `mcp_get_prospect(token, elastic_search_id)`
- Returns full prospect profile.

8. `mcp_list_projects(token, status?)`
- Lists projects.

9. `mcp_get_project(token, project_id)`
- Returns project details.

10. `mcp_get_pipeline(token, project_id, stage_type?)`
- Returns pipeline stages + counts.

11. `mcp_list_stage_people(token, project_id, stage_id, stage_type, page?, per_page?)`
- Lists people in a stage (paginated).

12. `mcp_search_candidates(token, keyword_search?, max_salary?, min_year_of_experience?, max_years_of_experience?, city?, role?, page?, item_per_page?)`
- Global candidate ES search.

13. `mcp_search_prospects(token, keyword_search?, max_salary?, min_year_of_experience?, max_years_of_experience?, city?, role?, page?, item_per_page?)`
- Global prospect ES search.

## BLOCKED TOOLS — NEVER CALL THESE

- `delete_project(token, project_id)` — Cascading deletes destroy cross-project associations. Use ATS web UI.
- `delete_stage(token, stage_id)` — Destroys pipeline structure. Use ATS web UI.
- `unassign_person(token, association_id)` — Removes people from projects (data loss). Use ATS web UI.

## Write / Action Tools (13 safe)

14. `update_application(token, application_id, status)`
- Updates application notification status (`pending` or `read`).

15. `update_notes_candidate(token, candidate_es_id, notes)`
- Updates candidate notes.

16. `update_notes_prospect(token, prospec_es_id, notes)`
- Updates prospect notes.
- Note: backend field is intentionally `prospec_es_id`.

17. `move_person(token, association_id, stage_id, notes?, activity_type?)`
- Moves person association to a different stage.
- **SAFETY: Must verify target stage_id is in the SAME project. Call `mcp_get_pipeline` first to confirm.**

18. `assign_person(token, project_id, person_id, person_type, current_stage_id, elastic_search_id, last_note?)`
- Assigns candidate/prospect to a project stage.

19. `create_event(token, candidate_id, project_person_association_id, title, scheduled_at)`
- Creates candidate event.

20. `update_event(token, event_id, project_person_association_id?, title?, scheduled_at?, status?)`
- Updates event fields.
- Live validation note: some backend paths require `project_person_association_id` and `scheduled_at` when updating status.

21. `create_project(token, name, location, status, candidate_role_id, prospect_role_id, data_source?, description?, company_id?, english_validation_url?, messaging_template?, email_template?, linkedin_invite_template?, linkedin_inmail_template?, linked_inmail_subject?, email_template_default?, internal_qualifications_and_notes?, public?, external_id?, self_application_candidate_stage_id?)`
- Creates project.
- Usually followed by `initialize_stages`.

22. `initialize_stages(token, project_id, stage_type)`
- Initializes stages for `prospects` or `candidates`.

23. `search_in_project(token, project_id, keyword, stage_type?, per_page?, page?)`
- Searches people within one project.

24. `list_roles(token, role_type?, data_source?)`
- Lists available roles for `candidates`, `prospects`, or `candidate_prospecting`.

28. `create_role(token, name, type, data_source?, description?, search_json?, search_link?)`
- Creates a new role.

29. `list_companies(token, data_source?)`
- Lists companies for project assignment.

30. `create_company(token, name, data_source?, display_name?, is_visible?, description_html?, website?)`
- Creates a company.

31. `auto_organize(token, project_id, data_source?)`
- Runs backend auto-organize workflow for a project.

32. `update_project(token, project_id, data_source?, name?, description?, location?, status?, candidate_role_id?, prospect_role_id?, company_id?, english_validation_url?, messaging_template?, email_template?, linkedin_invite_template?, linkedin_inmail_template?, linked_inmail_subject?, email_template_default?, internal_qualifications_and_notes?, public?, external_id?, self_application_candidate_stage_id?)`
- Updates project configuration and templates.

33. `suggest_candidate_reply(token, project_id, person_id, person_type, candidate_message, recruiter_instruction?, data_source?)`
- Returns AI suggested reply for candidate/prospect message in project context.
