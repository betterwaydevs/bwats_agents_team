# BWATS Feature Backlog

> Single source of truth for all tasks. Updated: 2026-03-01

## How This Works

- **This file**: Scannable master list. One line per task with status and owner.
- **`specs/<ID>.md`**: Full requirements, acceptance criteria, dependencies, references.
- **`progress/<ID>.md`**: Running log of work done, findings, blockers, current state.

When picking up a task, agents MUST read both the spec and progress files before starting work.

---

## Active / High Priority

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| **D1** | **Deploy M1, M2, M3, M7, L6, P2 & Pending Changes to Production** | **DEPLOY** | **pending** | — | [spec](specs/D1-deploy-m1-m2.md) |
| **W1** | **Multi-Agent Team Delivery Workflow** | **PROCESS** | **in-progress** | — | [spec](specs/W1-multi-agent-delivery-workflow.md) |
| **S1** | **Shark Helpers — Multi-Tenant Support & Deployment** | **BOTH** | **pending** | — | [spec](specs/S1-shark-helpers-multi-tenant.md) |
| **S2** | **Extension Automation Detection Test Rig** | **EXT** | **pending** | — | [spec](specs/S2-automation-detection.md) |
| **S3** | **Sales Outreach Campaign (V1)** | **BOTH** | **pending** | — | [spec](specs/S3-sales-campaign.md) |

## Dev-Complete (awaiting D1 deploy + live verification)

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| M1 | Email Account Stickiness Per Person | BACK | **dev-complete** | backend-developer | [spec](specs/M1-email-account-stickiness.md) |
| M2 | Email Event Tracking (Opens, Clicks, Bounces) | BOTH | **dev-complete** | backend-developer | [spec](specs/M2-email-event-tracking.md) |
| M3 | Auto-Reply Email for Job Applications | BOTH | **dev-complete** | backend-developer | [spec](specs/M3-auto-reply-email.md) |
| P2 | Auto-Organize Housekeeper + Cross-Project Touchpoints | BOTH | **dev-complete** | — | [spec](specs/P2-auto-organize-housekeeper.md) |
| L6 | CLI Token Page — Browser-based auth for /ats | FRONT | **dev-complete** | frontend-developer | [spec](specs/L6-cli-token-page.md) |
| P3 | Add Prospect — Manual E2E Test | TEST | **dev-complete** | — | [spec](specs/P3-add-prospect-e2e-test.md) |
| M9 | Incoming WhatsApp Messages & Notifications | BOTH | **dev-complete** | — | [spec](specs/M9-whatsapp-incoming-notifications.md) |
| P1 | Prospects Grid Performance — Reduce Network Calls & Freezing | FRONT | **dev-complete** | frontend-developer | [spec](specs/P1-prospects-grid-freeze.md) |
| QF5 | Reduce WhatsApp unread polling — only poll when dropdown open | FRONT | **dev-complete** | — |

## Medium Priority

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| M8 | Task Supervisor Agent | BACK | pending | — | [spec](specs/M8-task-supervisor-agent.md) |
| M10 | LinkedIn AI Reply — Phase 1 ALL PASS; Phase 2 (Conversation Analyzer) deferred | EXT/BACK | **dev-complete** | — | [spec](specs/M10-linkedin-ai-reply.md) |

## Low Priority / Future

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| L2 | Prerender / SEO Meta Tags | FRONT/INFRA | pending | — | [spec](specs/L2-prerender-seo.md) |
| L5 | /ats CLI Skill — Interactive ATS from CLI | TOOL | **in-progress** | — | [spec](specs/L5-ats-cli-skill.md) |

## Delegated to Interns (QA on delivery)

| ID | Title | Status | Our Task |
|----|-------|--------|----------|
| INT1 | Global Super Admin Settings (multi-tenant) | in progress | QA + acceptance testing when delivered |
| INT2 | Expanded Template System | in progress | QA + acceptance testing when delivered |
| INT3 | Duplicate Candidate Detection & Merge | in progress | QA + acceptance testing when delivered |

## Done (deployed to live + verified)

| ID | Title | Completed |
|----|-------|-----------|
| P4 | Profile Not Loading — Source Mismatch Fallback | Mar 2026 |
| M4 | Filter People by Last Outreach Date | Mar 2026 |
| M5 | Frontend Permission UI Changes | Feb 2026 |
| M6 | Frontend LinkedIn "My Connections" Filter | Feb 2026 |
| M7 | Replace Hardcoded "Laura Pulgarin" in Templates | Mar 2026 |
| L1 | Virtual Machines — Kamatera Integration | Feb 2026 |
| QF1 | Verify UNSUBSCRIBE_SECRET in Xano env | Mar 2026 |
| QF2 | Fix email inbox hurl test (HTML vs JSON) | Feb 2026 |
| QF3 | Bulk cleanup 43 zombie "executing" tasks on dev | Feb 2026 |
| QF6 | Verify WHAPI webhook is delivering real messages to Xano | Mar 2026 |
| — | AI Reply Suggestion Agent (LinkedIn + Email) | Feb 2026 |
| — | Email Round Robin + Inbox + AI Draft | Feb 2026 |
| — | Add Application Tool to Recruiter Assistant | Feb 2026 |
| — | Scoring Agent: pre-fetch person data fix | Feb 2026 |
| — | People endpoint: touchpoints limit + pagination | Feb 2026 |
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
- **DEVCOMPLETE** — Coded, tested on dev, QA passed. Awaiting deploy to production + live verification.
- **Status**: `pending` → `in-progress` → `dev-complete` → `done`
- **done** = deployed to live + verified working in production.
