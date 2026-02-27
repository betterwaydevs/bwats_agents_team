# L3: LinkedIn Matching Optimization

**Priority**: Low
**Type**: BACK
**Project**: bwats_xano

## Problem
LinkedIn URL variations cause matching failures between extension data and backend records.

## Tasks
- [ ] Create `associations/normalize_linkedin_for_matching` helper
- [ ] Update `automatic_action_association` for exact match
- [ ] Normalize `Connection_Profile_URL` on save

## Acceptance Criteria
- LinkedIn URLs are normalized before comparison (trailing slashes, case, www prefix)
- Matching works regardless of URL format variation
- Existing records are normalized on save

## References
- `requirements/linkedin_matching_optimization.md`
