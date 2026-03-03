# QF17 — Extension Slow Loading — Switch to Fast Endpoint

> **Priority**: Medium | **Type**: EXT + BACK | **Status**: pending
> **Projects**: bw_cold_recruiting (extension), bwats_xano (backend)

## Problem

The cold recruiting extension takes a long time to load because it still uses the old `unparsed_count` endpoint (~22s) instead of the new optimized `prospect_parse_status_counts` endpoint (~0.5s) created in QF13. The ATS dashboard is fast because it uses the new endpoint, but the extension was never updated.

Additionally, the tasks fetch on startup (`GET /tasks?per_page=200`) has an N+1 query problem — 5 sequential DB queries per task in a foreach loop. With 200 tasks, that's ~1,000 DB queries.

## Startup API Calls (current)

| Order | Endpoint | Time | Issue |
|-------|----------|------|-------|
| 1 | `GET /api:Ks58d17q/auth/me` | Fast | OK |
| 2 | `GET /api:zE_czJ22/unparsed_count` | ~22s | **Use `prospect_parse_status_counts` instead (~0.5s)** |
| 3 | `GET /api:i2KWpEI8/tasks?per_page=200` | Slow | **N+1 problem: 5 queries × 200 tasks** |

## Requirements

### R1 — Switch extension to fast count endpoint

Update `bw_cold_recruiting/classes/UnparsedProspectManager.js`:
- Change `countApiUrl` from `/api:zE_czJ22/unparsed_count` to `/api:zE_czJ22/prospect_parse_status_counts`
- Update response parsing — new endpoint returns `{ pending, conflict, parsing, failed, total_unparsed }` instead of the old grouped SQL format
- Deploy `prospect_parse_status_counts` to v1 first (QF13 AC1 prerequisite)

### R2 — Investigate tasks N+1 performance (separate follow-up)

The `get_tasks` function (`functions/9641_get_tasks.xs`) does 5 DB lookups per task in a foreach loop:
- `db.get parsed_prospect` (or `parsed_candidate`)
- `db.query project_person_association`
- `db.get task_type_definition`
- `db.get project`
- `db.query free_in_mail_to_person`

With per_page=200, that's ~1,000 queries. Options:
- Reduce `per_page` in extension to 20-50 (quick win)
- Batch the enrichment queries on the backend (proper fix)
- Both

## Acceptance Criteria

- [ ] **AC1**: Extension uses `prospect_parse_status_counts` instead of `unparsed_count`
- [ ] **AC2**: Extension prospect count loads in < 2 seconds
- [ ] **AC3**: Extension version bumped in manifest.json
- [ ] **AC4**: Tasks fetch per_page reduced to reasonable number (20-50) or backend N+1 fixed

## Files to Modify

| File | Change |
|------|--------|
| `bw_cold_recruiting/classes/UnparsedProspectManager.js` | Switch `countApiUrl` to new endpoint, update response parsing |
| `bw_cold_recruiting/popup.js` | Update any count display logic if response format changed |
| `bw_cold_recruiting/manifest.json` | Version bump |

## Dependencies

- QF13 AC1 (deploy `prospect_parse_status_counts` to v1) must be done first

## References

- Old endpoint: `apis/prospects/16900_unparsed_count_GET.xs` (~22s)
- New endpoint: `apis/prospects/prospect_parse_status_counts_GET.xs` (~0.5s)
- Extension manager: `bw_cold_recruiting/classes/UnparsedProspectManager.js`
- Tasks function: `bwats_xano/functions/9641_get_tasks.xs` (N+1 issue)
