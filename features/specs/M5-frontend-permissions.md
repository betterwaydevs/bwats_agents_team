# M5: Frontend Permission UI Changes

**Priority**: Medium
**Type**: FRONT
**Project**: nearshore-talent-compass

## Problem
User project permissions middleware is deployed on backend but frontend needs updates to respect it.

## Tasks
- [ ] Send auth token on project list + detail calls
- [ ] Decode JWT to check `user_role_id` for UI-level logic
- [ ] Hide unauthorized projects in UI

## Acceptance Criteria
- Frontend sends auth token on all project-related API calls
- Users only see projects they have permission to access
- UI elements are hidden/disabled based on user role

## References
- `notes/frontend_permission_changes.md`
