# QF11 — Extension Duplicate Detection

> **Type**: EXT/BACK | **Priority**: Medium | **Status**: pending

## Problem

The cold recruiting extension (`bw_cold_recruiting`) keeps finding "new" people on every run of the same LinkedIn search page, even when those profiles have already been saved to the database. This suggests the duplicate/existing-person detection logic isn't working correctly — the extension should recognize profiles it has already captured and skip or mark them accordingly.

## Investigation Needed

1. **How does the extension currently detect existing prospects?**
   - Does it check the Xano backend for existing `linked_recruit_profile_id` matches?
   - Does it rely on local storage / session state that gets cleared?
   - Is the matching logic using the correct identifier (profile ID vs public URL)?

2. **Where does the "new person" determination happen?**
   - In `AutoCaptureManager.js` during page scan?
   - In the profile list building step?
   - In the Xano `create_prospect_from_html` or `profile_submission` endpoint?

3. **What should happen for existing prospects?**
   - Skip them entirely (don't open the profile tab)
   - Show them as "already captured" in the UI
   - Still update their data if newer HTML is available?

## Acceptance Criteria

- [ ] AC1: Investigate and document the current duplicate detection flow
- [ ] AC2: Identify why existing prospects are being treated as new
- [ ] AC3: Fix the detection logic so already-captured profiles are recognized on the search results page
- [ ] AC4: Existing profiles should be visually distinguished (e.g., different status indicator) from truly new ones
- [ ] AC5: The extension should not re-open and re-save profiles that are already in the database
- [ ] AC6: Add unique database indexes on the prospects table to prevent duplicates at the DB level — unique index on `linkedin_profile` (or `linked_recruit_profile_id`) and unique index on `email` (where not null/empty). This is the hard guarantee that no duplicates can be created regardless of application logic.

## References

- Extension: `../bw_cold_recruiting/`
- Key files: `classes/AutoCaptureManager.js`, `classes/ProfileStatusManager.js`, `xano-api.js`, `content.js`
- Xano prospect endpoints: API group `zE_czJ22`
