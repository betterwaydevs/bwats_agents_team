# P4: Profile Page Not Loading — Source Mismatch Fallback

**Priority**: URGENT (recurring regression)
**Type**: FRONT + investigation
**Status**: pending

## Problem

Accessing `/profile/juliano-tech-lead--Hnxjc5wB1gtBcfFRFiOy?source=candidates` shows "Candidate not found" even though the person exists in ElasticSearch as a **prospect**.

This is a recurring issue — was fixed earlier this week but has regressed.

### Root Cause

In `BwatsProfile.tsx` (lines 109-121), the fallback logic only runs when `sourceParam` is NOT explicitly set:

```tsx
if (!hasHits && !sourceParam) {
  // try the other index...
}
```

When a URL has `?source=candidates` (e.g., from a link in a grid, notification, or bookmark), `sourceParam` is truthy, so the fallback is **skipped**. If the person only exists in the other index (prospect in this case), the page fails.

### Likely Scenario

The person "Juliano" was converted from prospect to candidate, but the conversion was incomplete:
- The prospect record still exists in ElasticSearch
- The candidate record was never created in ElasticSearch (or the ES index wasn't updated)
- Links pointing to `?source=candidates` now break

## Requirements

### Fix 1: Always fallback to the other index (FRONT)

In `BwatsProfile.tsx`, remove the `!sourceParam` guard from the fallback:

```tsx
// BEFORE (broken):
if (!hasHits && !sourceParam) { ... }

// AFTER (fixed):
if (!hasHits) { ... }
```

This way, if `?source=candidates` finds nothing, it automatically tries `?source=prospects` (and vice versa). If found in the other index, update `dataSource` state so the profile renders correctly with the right badge (Prospect vs Candidate).

### Fix 2: Investigate the specific broken record

Check this person across both systems:
1. Does `juliano-tech-lead--Hnxjc5wB1gtBcfFRFiOy` exist in `parsed_candidate` table in Xano?
2. Does it exist in `parsed_prospect` table?
3. Does it exist in ElasticSearch candidates index? Prospects index?
4. If conversion happened, was it partial? (candidate created in Xano but not indexed in ES)

### Fix 3: Prevent future incomplete conversions

Review `convertProspectToCandidate` flow to ensure ES re-indexing happens after conversion.

## Acceptance Criteria

- [ ] `/profile/{slug}?source=candidates` loads the person even if they only exist as a prospect
- [ ] `/profile/{slug}?source=prospects` loads the person even if they only exist as a candidate
- [ ] The correct type badge (Prospect/Candidate) shows based on where the person was actually found
- [ ] The specific Juliano profile loads correctly
- [ ] No regression on profiles that exist in the correct index

## Files to Modify

- `nearshore-talent-compass/src/apps/bwats/pages/BwatsProfile.tsx` — Remove `!sourceParam` guard (line ~114)

## References

- Profile URL: `https://bwats.betterway.dev/profile/juliano-tech-lead--Hnxjc5wB1gtBcfFRFiOy?source=candidates`
- Previous fix: was solved earlier this week but regressed
