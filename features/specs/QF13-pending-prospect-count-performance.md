# QF13 — Pending Prospect Count Performance

> **Type**: BOTH (BACK + EXT + FRONT) | **Priority**: Medium | **Status**: pending

## Problem

The cold recruiting extension (`bw_cold_recruiting`) displays a count of pending (unparsed) prospects. This query is extremely slow — it scans the entire prospects table to filter by `parse_status`. The extension becomes sluggish waiting for this count, and the information would be more useful in the ATS dashboard anyway.

## Goals

1. Make the pending/conflict count fast (sub-second response)
2. Surface the count in the ATS frontend (not just the extension)
3. Reduce load on the extension

## Approaches to Investigate

### Option A: Separate Queue Table
- Move pending and conflict prospects to a dedicated `prospect_queue` table
- When a prospect is created, insert into `prospect_queue` with status
- When parsed successfully, remove from `prospect_queue`
- Count query becomes a simple `COUNT(*)` on a small table instead of filtering a massive table
- **Pros**: Fastest queries, clean separation
- **Cons**: Two tables to maintain, migration needed for existing records

### Option B: Xano Counter / Aggregation Cache
- Maintain a cached counter (in a settings/stats table) that increments on insert and decrements on parse
- Refresh via scheduled task periodically to correct drift
- **Pros**: Instant count (single row read), no table restructure
- **Cons**: Counter can drift, needs reconciliation logic

### Option C: Database Index + Optimized Query
- Add a database index on `parse_status` in the prospects table
- Use a dedicated count endpoint that only does `COUNT(*) WHERE parse_status = 'pending'`
- **Pros**: No schema change, simplest to implement
- **Cons**: May still be slow if table is very large, depends on Xano's query optimization

## Acceptance Criteria

- [ ] AC1: Investigate current query — what endpoint does the extension call and why is it slow?
- [ ] AC2: Choose approach and implement fast pending/conflict count
- [ ] AC3: Add pending count to ATS dashboard (visible to users)
- [ ] AC4: Extension uses the same fast endpoint (or removes count display)
- [ ] AC5: Response time for count < 500ms

## References

- Extension: `../bw_cold_recruiting/`
- Xano prospects API group: `zE_czJ22`
- ATS Frontend: `../nearshore-talent-compass/`
