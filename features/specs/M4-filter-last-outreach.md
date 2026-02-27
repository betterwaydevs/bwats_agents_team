# M4: Filter People by Last Outreach Date

**Priority**: Medium
**Type**: BOTH
**Projects**: bwats_xano, nearshore-talent-compass

## Problem
No way to search/filter people in a stage by when they were last contacted.

## Tasks
### Backend
- [ ] Add `last_outreach_date` filter to association/people endpoint
- [ ] Query touchpoints for most recent per person

### Frontend
- [ ] Date range filter in people-in-stage view

## Acceptance Criteria
- Users can filter people by "last contacted" date range
- Filter works correctly across all stages
- Performance acceptable (no slow queries on large datasets)

## Dependencies
None
