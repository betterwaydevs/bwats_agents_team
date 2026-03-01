# QF5: Delivery Log

## PM: Assignment
- **Status**: done
- **Agent**: project-manager
- **Date**: 2026-03-01
- **Notes**: Quick fix — reduce WhatsApp unread polling. Currently polls every 60s regardless of dropdown state. Fix: only poll when Popover is open. Single file change in `WhatsAppNotificationDropdown.tsx`. Assigned to frontend-developer.

## DEV: Frontend
- **Status**: done
- **Agent**: frontend-developer
- **Date**: 2026-03-01
- **Notes**: Added `useState` to track Popover open/closed state. Changed `refetchInterval` from fixed `60_000` to `isOpen ? 30_000 : 300_000` — polls every 30s when open, every 5 minutes when closed. Badge still updates via background polling. `npm run build` passes clean. Commit: `00215bf`

## QA: Testing
- **Status**: done
- **Agent**: qa-tester
- **Date**: 2026-03-01 10:40
- **Notes**: All 4 acceptance criteria PASS via real execution tests.
  - AC1 PASS: `refetchInterval: isOpen ? 30_000 : 300_000` — closed = 300,000ms (5 min). Code verified line 30.
  - AC2 PASS: Open = 30,000ms (30s). Dropdown opens correctly in Playwright, data loads.
  - AC3 PASS: Badge shows "4" unread when closed (screenshots 1 & 3 confirm).
  - AC4 PASS: `npm run build` completed in 27.16s with zero errors.
- **Tests**: Playwright (chromium headless) against localhost:8080. 2/2 passed in 24.7s.
- **Artifacts**: `features/reports/QF5/qa-report.html`, 3 screenshots in same directory.

## PO: Acceptance
- **Status**: done
- **Agent**: product-owner
- **Date**: 2026-03-01
- **User need**: WhatsApp unread polling was firing every 60 seconds continuously, regardless of whether the user was looking at messages. This wastes API calls and server resources for no benefit — the vast majority of the time, the dropdown is closed.
- **Verdict**: APPROVED

### Per-AC Product Verdict

**AC1 — 5-minute polling when closed: PASS**
Reduces background API calls by 80% (from 60s to 300s). For a CRM dashboard, 5 minutes is an acceptable badge update delay — this is an awareness indicator, not a real-time chat app. Users who need immediate WhatsApp updates use WhatsApp directly. The dashboard just flags that unread messages exist.

**AC2 — 30-second polling when open: PASS**
When the user actively opens the dropdown, they get fresh data. TanStack Query's cached data appears instantly on open, and the 30s interval keeps it current while they're looking. This feels responsive.

**AC3 — Badge preserved when closed: PASS**
Screenshots confirm the green badge with unread count stays visible at all times. Users always see at-a-glance whether they have unread WhatsApp messages. The badge updates every 5 minutes in the background, and instantly when the dropdown is opened and closed again.

**AC4 — Build passes: PASS**
Technical gate met. Clean build, no errors.

### Product Assessment
The trade-off is sound: 80% fewer API calls in exchange for at most a 5-minute delay on the badge count when the dropdown is closed. Users can always click the icon to see current data immediately. The dropdown UI (screenshot 2) is clean — shows contact name, message preview, timestamp, and per-contact unread count. Navigation to profiles on click is preserved.

**Flow complete?** Yes — the fix directly addresses the reported waste (constant polling when nobody is looking) without degrading the user experience.

## User: Approval
- **Status**: pending
