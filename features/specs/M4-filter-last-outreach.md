# M4: Filter People by Last Outreach Date

**Priority**: Medium
**Type**: BOTH
**Projects**: bwats_xano, nearshore-talent-compass

## Problem
No way to search/filter people by when they were last contacted. Users need to find people who haven't been reached out to recently (e.g., cold prospects to re-engage).

## Tasks
### Backend
- [ ] Add `last_outreach_date` filter to association/people endpoint
- [ ] Query touchpoints for most recent contact per person
- [ ] Support date range filtering (before/after/between)

### Frontend
- [ ] Date range filter on the **prospect grid**
- [ ] Date range filter on the **candidate grid**
- [ ] Clear UX for "not contacted since [date]" use case

## Acceptance Criteria
- Users can filter prospects and candidates by "last contacted" date range
- Filter works on both prospect grid and candidate grid
- Supports "not contacted since X" (find stale/cold contacts)
- Filter works correctly across all stages
- Performance acceptable (no slow queries on large datasets)

## Dependencies
None
