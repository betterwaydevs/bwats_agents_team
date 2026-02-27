# M6: Frontend LinkedIn "My Connections" Filter

**Priority**: Medium
**Type**: FRONT
**Project**: nearshore-talent-compass

## Problem
No way to filter tasks/people by LinkedIn connections of the current user.

## Tasks
- [ ] Add "My Connections" toggle in tasks filter area
- [ ] Get user ID from `GET /auth/me` or JWT
- [ ] Append `connected_to_user_id` param when filter active

## Acceptance Criteria
- Toggle filters people/tasks to show only the current user's LinkedIn connections
- Filter state persists during session
- Clear indication when filter is active

## References
- `notes/frontend_linkedin_connection_filter.md`
