# M4: Filter People by Last Outreach Date — Progress

## Status: In Progress (Backend + Frontend + Testing Complete)

## 2026-02-27 — Implementation

### Backend (Xano)
- **File**: `bwats_xano/apis/association/16944_association_project_project_id_people_GET.xs`
- Added `timestamp? touchpoint_after?` and `timestamp? touchpoint_before?` inputs (nullable + optional)
- Filter logic in `processAssociation()` lambda:
  - `touchpoint_after`: excludes people whose latest touchpoint is before this date, or who have no touchpoints
  - `touchpoint_before`: excludes people whose latest touchpoint is after this date; people with NO touchpoints are included
- Deployed to Xano development branch via MCP (API ID 16944, Group 1513)

### Frontend (React)
- **File**: `nearshore-talent-compass/src/components/project/GridAdvancedFilters.tsx`
- Added date picker UI using shadcn Calendar + Popover
- Touchpoints section now spans 2 columns with: Has/None dropdown + After... + Before... date pickers
- Updated `clearAllFilters` and `hasActiveFilters` to include date state
- No changes needed to `ContactListTable.tsx` or `projectApi.ts` — they already supported the params

### Key Bug Found
- **XanoScript nullable vs optional**: `timestamp touchpoint_after?` only makes the field optional, NOT the type nullable. Xano coerces missing nullable=false values to `""` or `0`, making the filter always trigger. Fix: `timestamp? touchpoint_after?` (nullable type + optional field).

### Verification — curl
| Filter | items.length | Expected |
|--------|-------------|----------|
| Baseline (no filter) | 26 | 26 |
| touchpoint_after=Feb 1 2024 | 13 | ~13 |
| touchpoint_before=Feb 1 2024 | 13 | ~13 |
| touchpoint_after=Feb 25 2026 | 1 | Few |
| Both dates (range) | 12 | Subset |

### Verification — Playwright UI
| Step | Rows |
|------|------|
| Baseline (All Stages) | 24 |
| After Jan 31 filter | 17 |
| + Before Feb 24 | 15 |
| + Has Touchpoints | 11 |
| Clear All | 24 (restored) |

API calls verified: `touchpoint_after`, `touchpoint_before`, `has_touchpoints=yes` all sent correctly.

### Report
- Dashboard report: http://localhost:3000/reports/m4_touchpoint_filter_report.html
- 9 screenshots captured showing full filter flow with real result count changes
- HTML + PDF generated

## Remaining
- Update `itemsTotal` to reflect post-filter count (currently shows pre-filter DB count — cosmetic)
- Consider: Should people with NO touchpoints appear when only `touchpoint_after` is set?
