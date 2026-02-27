# M3: Auto-Reply Email for Job Applications

**Priority**: Medium
**Type**: BOTH
**Projects**: bwats_xano, nearshore-talent-compass

## Problem
No confirmation email is sent when someone applies to a job. Need auto-reply functionality.

## Tasks
- [ ] Create `application_auto_reply` email account
- [ ] Trigger auto-reply via `enqueue_email` in application flow
- [ ] Configurable template per project

## Acceptance Criteria
- Applicants receive a confirmation email after submitting
- Template is configurable per project
- Uses the auto-reply email account consistently

## Dependencies
- **M1** (Email Account Stickiness) — should be done first so replies stick to the auto-reply account
