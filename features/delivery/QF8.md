# QF8 — Frontend Laura Cleanup — Delivery Report

> **Status**: done | **Date**: 2026-03-03

## Summary

Removed all 15+ hardcoded references to "Laura" / "Laura Pulgarin" across 9 frontend files in `nearshore-talent-compass`, replacing them with dynamic values from the authenticated user context (`useAuth`). Two new utility functions (`buildFromEmail`, `splitUserName`) were created in `src/utils/emailUtils.ts` to centralize user-dependent string construction.

## Changes

| # | File | Change |
|---|------|--------|
| 1 | `src/utils/emailUtils.ts` | **NEW**: Added `buildFromEmail(user)` and `splitUserName(name)` utility functions with safe fallbacks |
| 2 | `src/apps/bwats/pages/BwatsEmailSettings.tsx` | Replaced 4 hardcoded placeholders: `"Laura Pulgarin"` -> `"Your Name"`, `"laura@email.betterway.dev"` -> `"you@email.betterway.dev"`, `"laura@betterway.dev"` -> `"you@betterway.dev"` |
| 3 | `src/apps/bwats/pages/BwatsProjectNew.tsx` | Replaced `'Laura'` in `getPreviewHtml`/`getPreviewSubject` with `userFirstName` from `splitUserName(user?.name)`; email preview `From:` uses `buildFromEmail(user)` |
| 4 | `src/apps/bwats/pages/BwatsProjectEdit.tsx` | Same pattern as ProjectNew: `splitUserName` for preview placeholders |
| 5 | `src/apps/bwats/pages/BwatsLinkedInTasks.tsx` | `from_email` field now uses `buildFromEmail(user)` |
| 6 | `src/components/profile/tabs/EmailSection.tsx` | `from_email` field now uses `buildFromEmail(user)` |
| 7 | `src/components/messaging/MessagingDialog.tsx` | `from_email` field now uses `buildFromEmail(user)` |
| 8 | `src/components/project/KanbanCard.tsx` | `from_email` field now uses `buildFromEmail(user)` |
| 9 | `src/components/project/ContactListTable.tsx` | `from_email` field now uses `buildFromEmail(user)` |
| 10 | `src/components/messaging/CreateTaskSection.tsx` | Hardcoded 3-user fallback list replaced with dynamic fallback using current auth user |
| 11 | `src/components/project/CreateHumanTasksDialog.tsx` | Hardcoded 3-user fallback list replaced with dynamic fallback using current auth user |
| 12 | `src/components/project/CreateLinkedInTasksDialog.tsx` | Hardcoded 3-user fallback list replaced with dynamic fallback using current auth user |

## Sign-offs

### DEV Sign-off
- **Agent**: frontend-developer
- **Date**: 2026-03-03
- **Status**: PASS
- **Notes**: All 15+ hardcoded "Laura" references replaced with dynamic user data. Two new utility functions created (`buildFromEmail`, `splitUserName`). Auth context (`useAuth`) added or extended in all consuming components. Build verified clean.

### QA Sign-off
- **Agent**: qa-tester
- **Date**: 2026-03-03 (executed during delivery pipeline)
- **Status**: PASS
- **Test Results**:
  - **Build**: PASS — `npm run build` completed in 26s, zero TypeScript errors, production bundle generated successfully (3,288 kB main chunk)
  - **Grep verification**: PASS — `grep -rn "Laura" src/` returned exactly 2 results, both in JSDoc comments in `src/utils/emailUtils.ts` (lines 6-7, documentation examples only — no runtime hardcoded strings)
  - **Import verification**: PASS — All 7 files using `buildFromEmail` have proper imports from `@/utils/emailUtils`; all 2 files using `splitUserName` have proper imports
  - **Auth hook verification**: PASS — All 10 modified component files import `useAuth` from `@/contexts/AuthContext` and destructure `user` from the hook call
- **Notes**: No issues found. Zero hardcoded "Laura" strings remain in runtime code. Fallback behavior is safe — `buildFromEmail` falls back to `"BetterWay <team@email.betterway.dev>"` when user is null/undefined; `splitUserName` falls back to `{ firstName: "Team", lastName: "Member" }`; dialog fallback lists use current auth user instead of hardcoded names.

### PO Sign-off
- **Agent**: product-owner
- **Date**: 2026-03-03
- **Status**: PASS
- **Verdict**:
  - **AC1 — No hardcoded "Laura Pulgarin" strings**: PASS — All 15+ occurrences replaced. Only JSDoc examples remain (documentation, not runtime).
  - **AC2 — Dynamic user data from auth context**: PASS — All components use `useAuth()` to get the logged-in user's name and email. Works for any user, not just Laura.
  - **AC3 — Placeholder text in settings page**: PASS — Changed to generic `"Your Name"`, `"you@email.betterway.dev"`, `"you@betterway.dev"` — appropriate neutral placeholders.
  - **AC4 — Email from_email construction**: PASS — `buildFromEmail(user)` dynamically constructs `"FirstName <username@email.betterway.dev>"` from the authenticated user's data, with a safe generic fallback.
  - **AC5 — Preview template placeholders**: PASS — `splitUserName` extracts first/last name for `{{user_first_name}}` and `{{user_last_name}}` template variable previews.
  - **AC6 — Fallback user lists in dialogs**: PASS — Three dialog components now use dynamic fallback from current auth user instead of hardcoded 3-person list. API-fetched team list still takes priority when available.
  - **AC7 — No regression**: PASS — Build succeeds with zero errors. No type mismatches.
- **Notes**: Clean implementation. The utility function approach (`emailUtils.ts`) is a good pattern — centralizes the logic, easy to maintain. Fallback values are sensible and will not break the UI for unauthenticated edge cases.

### Build & Dev Environment Verification
- **Date**: 2026-03-03 11:14 UTC
- **Build result**: PASS — `npm run build` completed in ~26s, zero errors, production bundle generated (3,288 kB main chunk)
- **Dist grep for "Laura"**: PASS — zero matches in `dist/` output; no hardcoded Laura strings ship to production
- **Dev server status**: PASS — `http://localhost:8080` returning HTTP 200; Vite dev server running (PID 537303, up since Feb 28)
- **Note**: Dev server is running via a bare `vite` process (no systemd unit). It serves source files directly (HMR), so code changes in `src/` are picked up automatically without restart. The `dist/` build confirms the production bundle is also clean.

### User: Approval
- **Status**: pending
