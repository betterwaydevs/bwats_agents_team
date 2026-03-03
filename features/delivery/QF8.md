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

## DEV: Frontend
- **Status**: done
- **Agent**: frontend-developer
- **Date**: 2026-03-03
- **Notes**: All 15+ hardcoded "Laura" references replaced with dynamic user data. Two new utility functions created (`buildFromEmail`, `splitUserName`). Auth context (`useAuth`) added or extended in all consuming components. Build verified clean.

## QA: Testing
- **Status**: done
- **Agent**: qa-tester
- **Date**: 2026-03-03 12:41 UTC
- **Screenshots**: qf8-email-settings.png, qf8-project-new.png, qf8-linkedin-tasks.png, qf8-dashboard.png, qf8-candidates.png
- **Report**: qf8-test-report.html
- **Notes**:
  **Build**: PASS — `npm run build` completed in 29.14s, zero TypeScript errors, production bundle 3,288 kB.
  **AC1 — No hardcoded "Laura Pulgarin" strings**: PASS — Playwright visited 5 pages; none contained "Laura Pulgarin". Source grep: only 2 JSDoc examples. Dist grep: zero matches.
  **AC2 — Dynamic user data from auth context**: PASS — Dashboard shows "Good morning, Pablo!" and header shows "Pablo Velasquez" — dynamic from auth context.
  **AC3 — Placeholder text in settings page**: PASS — Email Settings shows generic account names. No "Laura Pulgarin" or "laura@" in any placeholder.
  **AC4 — Email from_email construction**: PASS — No hardcoded "Laura <laura@..." anywhere in rendered pages.
  **AC5 — Preview template placeholders**: PASS — Project New shows generic placeholders. No hardcoded name in preview fields.
  **AC6 — Fallback user lists in dialogs**: PASS — No hardcoded user lists remain. Dynamic auth user fallback in all 3 dialog components.
  **AC7 — No regression**: PASS — Build clean, all 8 Playwright tests passed, dev server responsive at localhost:8080.

## PO: Acceptance
- **Status**: done
- **Agent**: product-owner
- **Date**: 2026-03-03
- **Notes**:
  **AC1 — No hardcoded "Laura Pulgarin" strings**: PASS — All 15+ occurrences replaced. Only JSDoc examples remain.
  **AC2 — Dynamic user data from auth context**: PASS — All components use `useAuth()`. Works for any user.
  **AC3 — Placeholder text in settings page**: PASS — Generic placeholders: "Your Name", "you@email.betterway.dev".
  **AC4 — Email from_email construction**: PASS — `buildFromEmail(user)` dynamically constructs from auth data with safe fallback.
  **AC5 — Preview template placeholders**: PASS — `splitUserName` extracts first/last name for template variables.
  **AC6 — Fallback user lists in dialogs**: PASS — Dynamic fallback from current auth user instead of hardcoded list.
  **AC7 — No regression**: PASS — Build succeeds with zero errors.

## User: Approval
- **Status**: pending
