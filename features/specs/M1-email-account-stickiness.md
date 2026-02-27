# M1: Email Account Stickiness Per Person

**Priority**: Medium
**Type**: BACK
**Project**: bwats_xano

## Problem
Once we email someone from a specific account, we should reuse that account for consistency. Currently round-robin may switch accounts between messages to the same person.

## Tasks
- [ ] In `process_email`, check email_send_log for most recent "sent" to same `to_email`
- [ ] If found + active + under limit → use it (bypass round-robin)
- [ ] Fallback to round-robin if sticky account unavailable

## Acceptance Criteria
- Second email to same person uses the same sending account as the first
- Falls back to round-robin only if sticky account is inactive or over limit
- No breaking changes to existing round-robin logic

## References
- File: `functions/communications/10568_process_email.xs`
