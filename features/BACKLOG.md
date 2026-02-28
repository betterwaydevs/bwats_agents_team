# BWATS Feature Backlog

> Single source of truth for all tasks. Updated: 2026-02-26

## How This Works

- **This file**: Scannable master list. One line per task with status and owner.
- **`specs/<ID>.md`**: Full requirements, acceptance criteria, dependencies, references.
- **`progress/<ID>.md`**: Running log of work done, findings, blockers, current state.

When picking up a task, agents MUST read both the spec and progress files before starting work.

---

## Active / High Priority

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| **P4** | **Profile Not Loading — Source Mismatch Fallback** | **FRONT** | **done** | — | [spec](specs/P4-profile-source-fallback.md) |
| P1 | Prospects Grid Freezing After Actions | FRONT | pending | — | [spec](specs/P1-prospects-grid-freeze.md) |
| P2 | Auto-Organize Housekeeper Failing to Move People | BACK | pending | — | [spec](specs/P2-auto-organize-housekeeper.md) |
| P3 | Add Prospect — Manual E2E Test | TEST | pending | — | [spec](specs/P3-add-prospect-e2e-test.md) |

| **W1** | **Multi-Agent Team Delivery Workflow** | **PROCESS** | **in-progress** | — | [spec](specs/W1-multi-agent-delivery-workflow.md) |

## Medium Priority

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| M1 | Email Account Stickiness Per Person | BACK | in-progress | backend-developer | [spec](specs/M1-email-account-stickiness.md) |
| M2 | Email Event Tracking (Opens, Clicks, Bounces) | BOTH | in-progress | backend-developer | [spec](specs/M2-email-event-tracking.md) |
| M3 | Auto-Reply Email for Job Applications | BOTH | pending | — | [spec](specs/M3-auto-reply-email.md) |
| M4 | Filter People by Last Outreach Date | BOTH | in-progress | — | [spec](specs/M4-filter-last-outreach.md) |
| M5 | Frontend Permission UI Changes | FRONT | pending | — | [spec](specs/M5-frontend-permissions.md) |
| M6 | Frontend LinkedIn "My Connections" Filter | FRONT | **done** | — | [spec](specs/M6-linkedin-connections-filter.md) |
| M7 | Replace Hardcoded "Laura Pulgarin" in Templates | BACK | **done** | — | [spec](specs/M7-replace-hardcoded-name.md) |
| M8 | Task Supervisor Agent | BACK | pending | — | [spec](specs/M8-task-supervisor-agent.md) |
| M9 | Incoming WhatsApp Messages & Notifications | BOTH | **monitoring** | — | [spec](specs/M9-whatsapp-incoming-notifications.md) |

## Low Priority / Future

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| L1 | Virtual Machines — Kamatera Integration | BOTH | **done** | — | [spec](specs/L1-virtual-machines.md) |
| L2 | Prerender / SEO Meta Tags | FRONT/INFRA | pending | — | [spec](specs/L2-prerender-seo.md) |
| L3 | LinkedIn Matching Optimization | BACK | pending | — | [spec](specs/L3-linkedin-matching.md) |
| L4 | CoreSignal Enrichment — Manual Fix | BACK | pending | — | [spec](specs/L4-coresignal-enrichment.md) |
| L5 | /ats CLI Skill — Interactive ATS from CLI | TOOL | **done** | — | [spec](specs/L5-ats-cli-skill.md) |
| L6 | CLI Token Page — Browser-based auth for /ats | FRONT | pending | — | [spec](specs/L6-cli-token-page.md) |

## Quick Fixes (< 15 min each)

| ID | Title | Type | Status | Owner |
|----|-------|------|--------|-------|
| QF1 | Verify UNSUBSCRIBE_SECRET in Xano env | BACK | pending | — |
| QF2 | Fix email inbox hurl test (HTML vs JSON) | BACK | pending | — |
| QF3 | Bulk cleanup 43 zombie "executing" tasks on dev | BACK | pending | — |
| QF4 | Extend retry 24h cutoff for old failed tasks | BACK | pending | — |
| QF5 | Reduce WhatsApp unread polling — only poll when dropdown open | FRONT | pending | — |
| QF6 | Verify WHAPI webhook is delivering real messages to Xano | BACK | pending | — |

## Delegated to Intern

| ID | Title | Status |
|----|-------|--------|
| INT1 | Global Super Admin Settings (multi-tenant) | not started |
| INT2 | Expanded Template System | not started |
| INT3 | Duplicate Candidate Detection & Merge | not started |

## Completed

| ID | Title | Completed |
|----|-------|-----------|
| — | AI Reply Suggestion Agent (LinkedIn + Email) | Feb 2026 |
| — | Email Round Robin + Inbox + AI Draft | Feb 2026 |
| — | Add Application Tool to Recruiter Assistant | Feb 22 |
| — | Scoring Agent: pre-fetch person data fix | Feb 26 |
| — | People endpoint: touchpoints limit + pagination | Feb 26 |
| — | User permissions middleware (get_permissions) | Feb 2026 |
| — | Retry & hung task system (dev + v1) | Feb 2026 |
| — | LinkedIn Conversation Analyzer (dev + v1) | Feb 2026 |
| — | Association search (accent-insensitive, multi-word) | Feb 2026 |

---

## Legend
- **BACK** — Backend (Xano APIs/Functions/Tasks)
- **FRONT** — Frontend (React/TypeScript)
- **EXT** — Browser extension
- **BOTH** — Backend + Frontend
- **TEST** — Testing/validation
- **Status**: `pending` → `in-progress` → `blocked` → `done`
