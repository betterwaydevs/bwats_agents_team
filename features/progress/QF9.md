# QF9: Extension Async Save — Progress

## Status: Implementation Complete

## Date: 2026-03-02

## Summary

Refactored both InvitationsDriver and ConnectionsDriver extraction flows to use fire-and-forget background saving instead of sequential blocking saves. The extraction UI now returns to the user immediately after DOM scraping, while the background service worker handles API saves asynchronously.

## Changes Made

### 1. `manifest.json` — Version bump
- `1.20.4` -> `1.20.5`

### 2. `extension/popup.js` — Async save for connections and invitations
- **Connections** (`setupManualExtract`): Replaced `saveConnectionsToXanoInBatches()` (which blocked the UI with `await`) with `chrome.runtime.sendMessage({ type: 'save-connections-to-xano' })` fire-and-forget.
- **Invitations** (`setupManualInvitationExtract`): Replaced the inline duplicate-check + `saveInvitationsToXanoInBatches()` blocking flow with `chrome.runtime.sendMessage({ type: 'save-invitations-to-xano' })` fire-and-forget. The background's `saveRecordsToXanoInBackground` handles batching with `Promise.allSettled` (batch size 5).
- Removed progress overlay usage (`showProgress`/`hideProgress`/`updateProgress`) from save flows since saves are no longer blocking.
- Added listeners for `xano-save-complete` and `xano-save-progress` messages from background to update activity feed when background save finishes.

### 3. `extension/sidepanel.js` — Mirror changes from popup.js
- Identical changes as popup.js (connections and invitations extraction flows).
- Same background notification listeners added.

### 4. `extension/content-capture.js` — Async save for auto-capture flows
- **Connections** (`startScrollAndCapture`): Replaced sequential `saveConnectionsToXano()` loop with `chrome.runtime.sendMessage({ type: 'save-connections-to-xano' })`.
- **Invitations** (invitation capture workflow): Replaced sequential `saveInvitationsToXano()` loop with `chrome.runtime.sendMessage({ type: 'save-invitations-to-xano' })`.

### 5. `extension/background.js` — Use batch saver in auto-extract too
- `performBackgroundExtract()`: Replaced `saveConnectionsToXanoSequentially()` with `saveRecordsToXanoInBackground('connections', records)` so auto-extracts also use the batch saver.

## Architecture After Changes

```
[User clicks Extract]
  -> popup/sidepanel calls driver.runManualExtract()
  -> DOM scraping completes (~1-2 seconds)
  -> chrome.runtime.sendMessage('save-*-to-xano', records)
  -> UI immediately shows "Saving N record(s) in background..."
  -> Button re-enables, user can continue browsing

[Background service worker]
  -> Receives records via message handler
  -> saveRecordsToXanoInBackground() processes in batches of 5
  -> Promise.allSettled per batch (parallel within batch)
  -> Failed saves logged with console.error (no silent failures)
  -> On completion, broadcasts 'xano-save-complete' to all clients
  -> popup/sidepanel show "Background save done: N saved" in activity feed
```

## Acceptance Criteria Coverage

| # | Criteria | Status |
|---|----------|--------|
| AC1 | InvitationsDriver extraction hands records to background batch saver | DONE |
| AC2 | ConnectionsDriver extraction hands records to background batch saver | DONE |
| AC3 | Extraction UI returns within 2 seconds regardless of record count | DONE |
| AC4 | background.js saveRecordsToXanoInBackground processes queued records (batch 5, allSettled) | DONE (already existed, now wired up) |
| AC5 | Failed saves logged to console (no silent failures) | DONE |
| AC6 | Popup/sidepanel shows "saving in background" indicator | DONE (activity feed messages) |

## Files Modified

- `/home/pablo/projects/bwats/linked_communication/manifest.json`
- `/home/pablo/projects/bwats/linked_communication/extension/popup.js`
- `/home/pablo/projects/bwats/linked_communication/extension/sidepanel.js`
- `/home/pablo/projects/bwats/linked_communication/extension/content-capture.js`
- `/home/pablo/projects/bwats/linked_communication/extension/background.js`
