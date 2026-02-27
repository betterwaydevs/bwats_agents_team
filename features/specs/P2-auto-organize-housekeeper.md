# P2: Auto-Organize Housekeeper — Failing to Move People

**Priority**: High
**Type**: BACK
**Project**: bwats_xano

## Problem
Pipeline housekeeper (`auto_organize`) fails to move some people to correct stages.

## Tasks
- [ ] Investigate which people fail and why (dev task 398, v1 task 414)
- [ ] Check endpoint 39456 (dev) / 39708 (v1) logs
- [ ] Fix movement logic
- [ ] Verify stage transitions after fix

## Acceptance Criteria
- All people are moved to their correct stages by the housekeeper
- No silent failures — errors are logged with person ID and reason
- Verified on both dev and v1

## References
- Dev task ID: 398, endpoint 39456
- V1 task ID: 414, endpoint 39708
