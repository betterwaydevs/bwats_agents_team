# QF8: Remove Hardcoded "Laura" / "Laura Pulgarin" from Frontend

## Status: COMPLETE (pending review)

## Date: 2026-03-02

## Summary

Replaced all 15 hardcoded references to "Laura" / "Laura Pulgarin" across 9 frontend files in `nearshore-talent-compass` with dynamic values from the auth context (`useAuth`).

## Changes Made

### New Utility Functions (`src/utils/emailUtils.ts`)

Added two helper functions:

1. **`buildFromEmail(user)`** — Constructs the Resend-compatible `from_email` header string from the authenticated user's data.
   - Example: `{ name: "Laura Pulgarin", email: "laura@betterway.dev" }` => `"Laura <laura@email.betterway.dev>"`
   - Falls back to `"BetterWay <team@email.betterway.dev>"` if user data is unavailable.

2. **`splitUserName(name)`** — Splits a full name into `{ firstName, lastName }` with safe fallbacks (`"Team"` / `"Member"`).

### Files Modified (9 files, 15 occurrences)

| # | File | Change |
|---|------|--------|
| 1 | `src/apps/bwats/pages/BwatsEmailSettings.tsx:87` | Placeholder `"Laura Pulgarin"` -> `"Your Name"` |
| 2 | `src/apps/bwats/pages/BwatsEmailSettings.tsx:110` | Placeholder HTML signature `"Laura Pulgarin"` -> `"Your Name"` |
| 3 | `src/apps/bwats/pages/BwatsEmailSettings.tsx:77` | Placeholder `"laura@email.betterway.dev"` -> `"you@email.betterway.dev"` |
| 4 | `src/apps/bwats/pages/BwatsEmailSettings.tsx:97` | Placeholder `"laura@betterway.dev"` -> `"you@betterway.dev"` |
| 5 | `src/components/profile/tabs/EmailSection.tsx:82` | `from_email: 'Laura <laura@...>'` -> `buildFromEmail(user)` |
| 6 | `src/apps/bwats/pages/BwatsProjectNew.tsx:250` | `'Laura'` in getPreviewHtml -> `userFirstName` from `splitUserName(user?.name)` |
| 7 | `src/apps/bwats/pages/BwatsProjectNew.tsx:264` | `'Laura'` in getPreviewSubject -> `userFirstName` from `splitUserName(user?.name)` |
| 8 | `src/apps/bwats/pages/BwatsProjectNew.tsx:707` | `"Laura <laura@...>"` in email preview -> `buildFromEmail(user)` |
| 9 | `src/apps/bwats/pages/BwatsProjectEdit.tsx:637` | `'Laura'` in getPreviewHtml -> `userFirstName` from `splitUserName(user?.name)` |
| 10 | `src/apps/bwats/pages/BwatsProjectEdit.tsx:651` | `'Laura'` in getPreviewSubject -> `userFirstName` from `splitUserName(user?.name)` |
| 11 | `src/apps/bwats/pages/BwatsLinkedInTasks.tsx:880` | `from_email: "Laura <laura@...>"` -> `buildFromEmail(user)` |
| 12 | `src/components/messaging/CreateTaskSection.tsx:74` | Hardcoded 3-user fallback list -> dynamic fallback using current auth user |
| 13 | `src/components/messaging/MessagingDialog.tsx:523` | `from_email: 'Laura <laura@...>'` -> `buildFromEmail(user)` |
| 14 | `src/components/project/CreateHumanTasksDialog.tsx:83` | Hardcoded 3-user fallback list -> dynamic fallback using current auth user |
| 15 | `src/components/project/KanbanCard.tsx:223` | `from_email: "Laura <laura@...>"` -> `buildFromEmail(user)` |
| 16 | `src/components/project/CreateLinkedInTasksDialog.tsx:51` | Hardcoded 3-user fallback list -> dynamic fallback using current auth user |
| 17 | `src/components/project/ContactListTable.tsx:929` | `from_email: "Laura <laura@...>"` -> `buildFromEmail(user)` |

### Import/Hook Changes

- Added `useAuth` import + `user` destructuring to: `BwatsProjectNew.tsx`, `BwatsProjectEdit.tsx` (added `user`), `EmailSection.tsx` (added `user`), `ContactListTable.tsx` (added `user`)
- Added `buildFromEmail` import to: `EmailSection.tsx`, `BwatsProjectNew.tsx`, `BwatsLinkedInTasks.tsx`, `MessagingDialog.tsx`, `KanbanCard.tsx`, `ContactListTable.tsx`
- Added `splitUserName` import to: `BwatsProjectNew.tsx`, `BwatsProjectEdit.tsx`

### Approach for Fallback User Lists

The three dialog components (`CreateTaskSection`, `CreateHumanTasksDialog`, `CreateLinkedInTasksDialog`) had identical hardcoded fallback lists with 3 specific users. These were replaced with a dynamic fallback that uses the current authenticated user. The API call to `getTeamUsers` still provides the full team list when available; the fallback only activates when the API fails.

## Build Verification

`npm run build` completed successfully with no TypeScript errors.

## Remaining "Laura" References

Only in JSDoc example comments in `src/utils/emailUtils.ts` (documentation, not runtime code).
