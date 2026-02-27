# W1 — Multi-Agent Team Delivery Workflow

**Type**: PROCESS
**Priority**: High
**Status**: in-progress
**Created**: 2026-02-27
**Updated**: 2026-02-27

---

## Problem Statement

Tasks are being marked as "done" without proper end-to-end verification. The orchestrator (PM) is not enforcing a delivery standard before closing tasks. Specific failures:

1. **Tailscale IP integration**: Code was written and deployed, but nobody verified the actual API response. The XanoScript was reading from the wrong response path (`resp.response.devices` instead of `resp.response.result.devices`), returning empty data. The frontend showed "—" for all Tailscale IPs. Screenshots were captured but not critically reviewed — empty data was accepted as a passing test.

2. **P4 Profile fix**: Tested on dev environment where the broken record (Juliano) doesn't exist. The fix was pushed to production without ever verifying the actual broken URL on the live server. A second bug (unhandled 404 from `getFullParsedProspect`) was only found when forced to test on live.

Both cases had the same root cause: **no real verification before declaring done**.

---

## Phase 1: Delivery Pipeline UI (DONE)

Structured reporting format + dashboard visualization. Completed 2026-02-27.

- [x] `features/DELIVERY_FORMAT.md` — standard format all agents write to
- [x] `features/delivery/<ID>.md` — per-task delivery log files
- [x] Dashboard pipeline UI: stage tracker (PM → DEV → QA → PO → User)
- [x] User approval gate (Approve / Request Changes buttons)
- [x] Screenshots visible inline with near-fullscreen lightbox
- [x] Mini pipeline dots on dashboard task cards
- [x] All 7 agent instruction files updated with delivery reporting section

---

## Phase 2: Agent Self-Verification (IN PROGRESS)

The core problem: agents deliver work without confirming it actually works. Every agent must verify their own output before reporting done.

### Requirement: Each Agent Must Use Its Full Toolset

Every task must be handled by the right specialist agent, and each agent must use all tools available to it:

| Agent | Must Verify Using |
|-------|-------------------|
| **backend-developer** | MCP connection to Xano, curl validation of endpoints with real data, read/write to `bwats_xano/LEARNINGS.md` |
| **frontend-developer** | `npm run build` passes clean, consult project conventions from `claude.md`, write learnings |
| **chrome-ext-developer** | Manifest version increment, popup/sidepanel sync check, write learnings |
| **python-developer** | Run scripts with sample data, verify output, write learnings |
| **qa-tester** | Run Playwright tests, capture screenshots, assert on actual data content (not just element visibility), generate reports, write learnings |
| **product-owner** | Review QA screenshots for correctness, verify acceptance criteria against real behavior, write learnings |
| **project-manager** | Review all agent reports before closing, verify screenshots show real data, write learnings |

### Requirement: Backend Must Prove Xano Connection Works

The backend-developer agent works from `bwats_xano/` where MCP is configured. Before reporting done:

1. Connect to Xano via MCP and verify the endpoint/function/table exists
2. Call the endpoint with `curl` using real auth tokens
3. Verify the response contains **correct, non-empty data** — not just HTTP 200
4. Document the verified response shape in the delivery log

### Requirement: QA Must Test Real Functionality

QA tests must assert on actual content, not just page loads:

- **Bad**: "Page loaded successfully, no errors"
- **Good**: "Tailscale IP column shows 100.64.0.1 for server NucBoxG3Plus"
- **Bad**: "Screenshot captured"
- **Good**: "Screenshot shows 3 unread notifications with message previews"

QA must generate reports with embedded screenshots that prove the feature works with real data.

### Requirement: Agents Must Use and Update Their Knowledge

Every agent must:

1. **Read learnings** before starting work — check project-specific `LEARNINGS.md` for known patterns and gotchas
2. **Write learnings** when discovering something — don't wait until end of session, write immediately
3. **Follow project conventions** — read the relevant `CLAUDE.md`/`claude.md` before making changes

### Requirement: No Handoff Without Self-Test

Before any agent reports their stage as "done" in the delivery log:

1. They must have **tested their own output** (build, curl, run, etc.)
2. They must have **iterated on failures** — fix and retest, don't just report the error
3. They must **document what they verified** in the delivery log Notes field
4. The delivery log must contain **proof** — commit hashes, curl output summaries, screenshot filenames

---

## Phase 3: Team Configuration & Settings (PLANNED)

Current issue: agent teams need proper configuration to ensure each agent has the right tools, MCP connections, and permissions.

### Requirements (to be expanded)

- Team settings that ensure backend-developer agent connects to Xano MCP
- Verification that agents can actually use their assigned tools before starting work
- Reports dashboard improvements — deeper integration, better report viewing interface
- Agent capability verification at team startup (can each agent do what it needs to?)

---

## Delivery Checklist (enforced by PM/orchestrator)

Every task — before being marked done — must pass ALL of the following:

1. **API verification**: If the task involves an API endpoint, call it with `curl` and verify the response contains correct, non-empty data. Don't trust that "no error" means "working".

2. **Screenshot review**: Run Playwright tests, then **visually inspect** the screenshots. Verify the feature is visible with real data — not just that the test didn't throw an error. If a column should show an IP, confirm the IP is in the screenshot.

3. **Live testing for user-reported bugs**: If a user reported a specific URL or scenario, test that exact URL on the live server (`http://pablo-home-linux.tailf79837.ts.net:8080/`). Dev-only testing is insufficient when the data doesn't exist in dev.

4. **Report with proof**: Generate the HTML/PDF report with embedded screenshots. The report must show the feature working — not just the page loading.

5. **External API integration tests**: When integrating with external APIs (Tailscale, Kamatera, etc.), verify the raw API response first before testing the frontend. If the API returns empty data, investigate before proceeding.

6. **Learnings updated**: If the agent discovered a pattern, gotcha, or fix during the task, it must be written to the relevant LEARNINGS.md before reporting done.

---

## Acceptance Criteria

### Phase 1 (DONE)
- [x] Documented delivery format spec (`DELIVERY_FORMAT.md`)
- [x] Dashboard pipeline UI with stage tracking
- [x] User approval gate in dashboard
- [x] All 7 agent files include delivery reporting instructions

### Phase 2 (IN PROGRESS)
- [ ] Backend agent instructions enforce MCP verification + curl with real data
- [ ] QA agent instructions enforce data assertions, not just visibility checks
- [ ] All agents instructed to read/write learnings on every task
- [ ] PM agent instructions enforce screenshot review + proof verification before closing
- [ ] Delivery log Notes field must contain proof of self-testing
- [ ] Process tested on at least one real task end-to-end with full verification

### Phase 3 (PLANNED)
- [ ] Team startup verifies each agent can connect to its required tools
- [ ] Reports dashboard shows richer detail
- [ ] Agent capability pre-flight check before task assignment

---

## Notes

This is an evolving process improvement. New requirements are added as failure modes are discovered during real task execution. The goal: when a task is marked done, it is **actually done** — verified with real data, documented with proof, and all knowledge captured.
