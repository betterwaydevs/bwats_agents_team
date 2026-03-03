# QF9: Extension Async Save — Invitations & Connections

**Type**: EXT
**Priority**: Medium
**Owner**: chrome-ext-developer

---

## Problem

The Chrome extension (`linked_communication`) saves invitations and connections synchronously with 1-second delays between each API call. When a user has many records to save, the extension freezes the UI for the entire duration. The extraction flow in `InvitationsDriver.js` and `ConnectionsDriver.js` waits for each save to complete before proceeding to the next.

### Current Flow (Slow)

1. Extract records from LinkedIn DOM
2. Loop through each record sequentially
3. Call `saveInvitation()` / `saveConnection()` per record — each waits for HTTP response
4. `sleep(1000)` between each call
5. Only after ALL saves complete does the UI unblock

A batch function already exists in `background.js` (`saveRecordsToXanoInBackground`) that uses `Promise.allSettled()` with batch size 5, but the main extraction flow doesn't use it.

## Solution

Change the extraction flow to fire-and-forget: hand records off to the background script's existing batch saver and return immediately to the user.

## Acceptance Criteria

| # | Criteria |
|---|----------|
| AC1 | `InvitationsDriver.js` extraction hands records to `background.js` batch saver instead of saving sequentially |
| AC2 | `ConnectionsDriver.js` extraction hands records to `background.js` batch saver instead of saving sequentially |
| AC3 | The extraction UI returns to the user within 2 seconds regardless of record count |
| AC4 | `background.js` `saveRecordsToXanoInBackground` processes the queued records in the background (batch size 5, `Promise.allSettled`) |
| AC5 | Failed saves in the background batch are logged to console (no silent failures) |
| AC6 | Extension popup/sidepanel shows a "saving in background" indicator while background saves are in progress (optional — nice to have) |

## Key Files

- `linked_communication/src/drivers/InvitationsDriver.js` — sequential save loop with `sleep(1000)`
- `linked_communication/src/drivers/ConnectionsDriver.js` — similar sequential save pattern
- `linked_communication/src/background.js` — existing `saveRecordsToXanoInBackground()` with `Promise.allSettled` batch processing

## Notes

- The 1-second delays were likely added to avoid rate limiting. The background batch saver already handles this with batch size 5 — verify rate limits are respected.
- No backend changes needed — same Xano endpoints, just called differently from the extension.
