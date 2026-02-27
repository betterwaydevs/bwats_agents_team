# M2: Email Event Tracking (Opens, Clicks, Bounces)

**Priority**: Medium
**Type**: BOTH
**Projects**: bwats_xano, nearshore-talent-compass

## Problem
No visibility into email delivery lifecycle after sending. Need to track opens, clicks, bounces from Resend webhooks.

## Tasks
### Backend
- [ ] Capture webhook events: email.delivered, email.opened, email.clicked, email.bounced
- [ ] Create `email_event` table
- [ ] Update email_send_log with delivery status
- [ ] Statistics API per account/project

### Frontend
- [ ] Event timeline view
- [ ] Stats page (open rate, click rate, bounce rate)
- [ ] Person profile: email engagement signals

## Acceptance Criteria
- All Resend webhook events are captured and stored
- email_send_log reflects latest delivery status
- Frontend shows per-account and per-project email statistics
- Person profile shows engagement history

## Dependencies
None
