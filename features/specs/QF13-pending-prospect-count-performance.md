# QF13 — Parsing Status Dashboard

> **Type**: FRONT | **Priority**: Medium | **Status**: backend-done

## Problem

The cold recruiting extension (`bw_cold_recruiting`) displays a count of pending (unparsed) prospects, but this information would be more useful in a dedicated parsing status dashboard in the ATS where users can monitor the parsing queue without having to check the extension.

**Backend Status**: ✅ Already implemented and tested on dev. New optimized endpoint `prospect_parse_status_counts` created. Just needs v1 deployment.

## Goals

1. **Frontend**: Create a new Parsing Status dashboard page to monitor prospect parsing queue
2. **No Extension Changes**: The existing extension keeps working (no modifications needed)
3. **Backend**: Deploy existing endpoint to v1 production (dev testing already done)

## What's Already Done

### Backend Endpoint (QF13 delivery — 2026-03-03)
- **New endpoint**: `prospect_parse_status_counts` (GET)
- **API ID**: 44639 (dev branch)
- **Response format**:
```json
{
  "pending": 63,
  "conflict": 2,
  "parsing": 40,
  "failed": 0,
  "total_unparsed": 105
}
```
- **Performance**: ~42x faster than old endpoint (22.3s → 0.53s avg)
- **Status**: Deployed to dev, tested, user-approved
- **Remaining**: Merge to v1 and verify production performance

## Acceptance Criteria

### AC1: Backend v1 Deployment
- [ ] `prospect_parse_status_counts` endpoint merged from dev to v1
- [ ] Response time < 500ms on v1 production (measured over 5 consecutive requests)
- [ ] curl validation confirms endpoint returns expected structure
- [ ] Data accuracy verified: counts match manual database query

### AC2: Parsing Status Dashboard Page
- [ ] New route `/ats/parsing` (or similar) added to ATS frontend
- [ ] Page displays real-time count of prospects by parse status
- [ ] Shows: pending, parsing, conflict, failed, total_unparsed
- [ ] Card-based layout using shadcn/ui components
- [ ] Auto-refresh every 30 seconds using TanStack Query
- [ ] Accessible from ATS sidebar navigation (e.g., "Parsing Queue" or "Parsing Status")
- [ ] **Reset Queue button**: resets all `conflict` and `parsing` (stuck) prospects back to `pending`. Calls `GET /api:zE_czJ22/unparsed_and_lock_reset`. Button should show confirmation dialog before executing, and display the count of reset records after.

### AC2.1: Backend — Update Reset Endpoint
- [ ] `unparsed_and_lock_reset` endpoint updated to also reset `conflict` status (not just `parsing`)
- [ ] Endpoint resets both `parsing` → `pending` AND `conflict` → `pending`
- [ ] Response includes count of records reset per status category
- [ ] Deployed to v1

### AC3: Integration & Deployment
- [ ] Frontend changes merged to main branch
- [ ] Parsing dashboard accessible in production ATS
- [ ] Manual verification: dashboard shows correct counts matching backend data
- [ ] Extension continues to work unchanged (uses old `unparsed_count` endpoint)

## Technical Details

### Backend (Already Implemented)
**Endpoint**: `prospect_parse_status_counts` (GET)
**API Group**: `prospects` (zE_czJ22)
**Implementation**: Option C from investigation — three indexed `db.query` COUNT operations instead of raw SQL

**Old endpoint** (`unparsed_count`) remains active for extension backward compatibility.

### Frontend (New Work)
**New Page**: `/ats/parsing` in `nearshore-talent-compass`

**Components Needed**:
- `ParsingStatusPage.tsx` — Main page component
- `useParsingStats.ts` — TanStack Query hook with 30s polling
- `StatusCard.tsx` (or reuse existing Card) — Display each status count

**API Integration**:
- Endpoint: `GET /api:zE_czJ22/prospect_parse_status_counts`
- Response: `{ pending, conflict, parsing, failed, total_unparsed }`

**Layout**:
```
┌─────────────────────────────────────┐
│  Parsing Status                      │
├─────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ Pending │ Parsing │ Conflict│    │
│  │   63   │   40    │    2    │     │
│  └──────┘  └──────┘  └──────┘       │
│                                      │
│  ┌──────┐  ┌──────┐                 │
│  │ Failed │ Total  │                │
│  │   0    │  105   │                │
│  └──────┘  └──────┘                 │
└─────────────────────────────────────┘
```

**Navigation**: Add "Parsing Queue" link to ATS sidebar (in `LayoutUser.tsx` or equivalent)

### Reset Endpoint (Backend Update Needed)
**Endpoint**: `GET /api:zE_czJ22/unparsed_and_lock_reset`
**File**: `apis/prospects/16910_unparsed_and_lock_reset_GET.xs`
**Current behavior**: Only resets `parsing` → `pending`
**Needed**: Also reset `conflict` → `pending`
**Auth**: Currently unauthenticated (placeholder `Authorization: token` header, no validation). Consider adding real auth.
**Reference**: Extension button in `bw_cold_recruiting/classes/UnparsedProspectManager.js`

### Extension (No Changes)
The extension (`bw_cold_recruiting`) continues using the old `unparsed_count` endpoint for now. See QF17 for switching extension to the fast endpoint.

## References

- Extension: `../bw_cold_recruiting/`
- Xano prospects API group: `zE_czJ22`
- ATS Frontend: `../nearshore-talent-compass/`
- Dashboard shell reference: `src/apps/bwats/pages/ProjectDetailPage.tsx` (for layout patterns)
