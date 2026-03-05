# BWATS Feature Backlog

> Single source of truth for all tasks. Updated: 2026-03-05

## How This Works

- **This file**: Scannable master list. One line per task with status and owner.
- **`specs/<ID>.md`**: Full requirements, acceptance criteria, dependencies, references.
- **`progress/<ID>.md`**: Running log of work done, findings, blockers, current state.

When picking up a task, agents MUST read both the spec and progress files before starting work.

---

## Active / High Priority

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| **W1** | **Multi-Agent Team Delivery Workflow** | **PROCESS** | **in-progress** | — | [spec](specs/W1-multi-agent-delivery-workflow.md) |
| **SEC1** | **Security Review Agent — Pre-QA Security Gate** | **TEAM** | **done** | — | [spec](specs/SEC1-security-review-agent.md) |
| **S1** | **Shark Helpers — Multi-Tenant Support & Deployment** | **BOTH** | **pending** | — | [spec](specs/S1-shark-helpers-multi-tenant.md) |
| **S2** | **Extension Automation Detection Test Rig** | **EXT** | **pending** | — | [spec](specs/S2-automation-detection.md) |
| **S3** | **Sales Outreach Campaign (V1)** | **BOTH** | **pending** | — | [spec](specs/S3-sales-campaign.md) |

## Medium Priority

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| M8 | Delivery Supervisor Agent (Post-Task Hook) | TEAM | pending | — | [spec](specs/M8-task-supervisor-agent.md) |
| M12 | AI Reply Context Enhancement — Knowledge Base & Project Context | BOTH | pending | — | [spec](specs/M12-ai-reply-context-enhancement.md) |
| **OPT1** | **Code Optimization Agent — Post-DEV Performance Gate** | **TEAM** | **pending** | — | [spec](specs/OPT1-code-optimization-agent.md) |
| QF7 | function.call → function.run sweep (touchpoint_create + others on v1) | BACK | done | — | [delivery](delivery/QF7.md) |
| QF8 | Frontend Laura cleanup — remove hardcoded "Laura" from ~11 files | BOTH | done | — | [delivery](delivery/QF8.md) |
| QF9 | Backend Async Processing — Prospect Save Returns Fast | BACK | dev-complete | — | [delivery](delivery/QF9.md) |
| L5 | /ats CLI Skill — Interactive ATS from CLI | TOOL | **in-progress** | — | [spec](specs/L5-ats-cli-skill.md) |
| **L8** | **ATS Skill — Migrate from curl/API to Xano MCP** | **BACK + TOOL** | **in-progress** | — | [spec](specs/L8-ats-mcp-migration.md) |
| L7 | Downloads Section & Extension Auto-Update Notification | BOTH | done | — | [delivery](delivery/L7.md) |
| QF10 | Prospect Parser — Replace OpenAI with Claude/Codex to save costs | BACK | pending | — | [spec](specs/QF10-prospect-parser-cost-optimization.md) |
| QF11 | Extension Duplicate Detection — Verify existing prospects are recognized on page | EXT | pending | — | [spec](specs/QF11-extension-duplicate-detection.md) |
| QF13 | Pending Prospect Count Performance — Fast count + move to ATS + reset button | BOTH | done | — | [delivery](delivery/QF13.md) |
| QF14 | Add_prospect conflict error — db.patch expects array, gets string | BACK | done | — | [delivery](delivery/QF14.md) |
| QF15 | Add .env deny rules to `.claude/settings.local.json` — agent permissions hardening | TEAM | done | — | |
| **QF16** | **Scoring Agent Reliability & Router Integration Fix** | **BACK** | **pending** | — | [spec](specs/QF16-scoring-agent-reliability.md) |
| QF17 | Extension Slow Loading — Switch to fast count endpoint + tasks N+1 fix | EXT + BACK | done | — | [delivery](delivery/QF17.md) |


## Low Priority / Future

| ID | Title | Type | Status | Owner | Spec |
|----|-------|------|--------|-------|------|
| INT1 | Multi-Tenant Branding — CSS-Based Logo & Colors | FRONT | done | — | [spec](specs/INT1-global-super-admin-settings.md) |
| L2 | Prerender / SEO Meta Tags | FRONT/INFRA | pending | — | [spec](specs/L2-prerender-seo.md) |

## Delegated to Interns (QA on delivery)

| ID | Title | Status | Our Task |
|----|-------|--------|----------|
| INT2 | Expanded Template System | pending | QA + acceptance testing when delivered |
| INT3 | Duplicate Candidate Detection & Merge | pending | QA + acceptance testing when delivered |

## Done (deployed to live + verified)

| ID | Title | Completed |
|----|-------|-----------|
| D1 | Deploy M1, M2, M3, M7, L6, P2 & Pending Changes to Production | Mar 2026 |
| M10 | LinkedIn AI Reply — Phase 1 (Reply Assistant) | Mar 2026 |
| M1 | Email Account Stickiness Per Person | Mar 2026 |
| M2 | Email Event Tracking (Opens, Clicks, Bounces) | Mar 2026 |
| M3 | Auto-Reply Email for Job Applications | Mar 2026 |
| M9 | Incoming WhatsApp Messages & Notifications | Mar 2026 |
| M11 | Dashboard AI Assistant — Claude API via membership token | Mar 2026 |
| P1 | Prospects Grid Performance — Reduce Network Calls & Freezing | Mar 2026 |
| P2 | Auto-Organize Housekeeper + Cross-Project Touchpoints | Mar 2026 |
| P3 | Add Prospect — Manual E2E Test | Mar 2026 |
| L6 | CLI Token Page — Browser-based auth for /ats | Mar 2026 |
| QF5 | Reduce WhatsApp unread polling — only poll when dropdown open | Mar 2026 |
| R1 | Job Board API Research | Mar 2026 |
| QF12 | Cross-Project Commit & Sync Audit | Mar 2026 |
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
- **RESEARCH** — Research/investigation task (no production code)
- **PROCESS** — Workflow/team process improvement
- **TEAM** — Agent/team configuration
- **DEPLOY** — Deployment task
- **DEVCOMPLETE** — Coded, tested on dev, QA passed. Awaiting deploy to production + live verification.
- **Status**: `pending` → `in-progress` → `dev-complete` → `done`
- **done** = deployed to live + verified working in production.
