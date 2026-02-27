# W1 — Multi-Agent Team Delivery Workflow

**Type**: PROCESS
**Priority**: High
**Status**: pending
**Created**: 2026-02-27

---

## Problem Statement

Tasks are being marked as "done" without proper end-to-end verification. The orchestrator (PM) is not enforcing a delivery standard before closing tasks. Specific failures:

1. **Tailscale IP integration**: Code was written and deployed, but nobody verified the actual API response. The XanoScript was reading from the wrong response path (`resp.response.devices` instead of `resp.response.result.devices`), returning empty data. The frontend showed "—" for all Tailscale IPs. Screenshots were captured but not critically reviewed — empty data was accepted as a passing test.

2. **P4 Profile fix**: Tested on dev environment where the broken record (Juliano) doesn't exist. The fix was pushed to production without ever verifying the actual broken URL on the live server. A second bug (unhandled 404 from `getFullParsedProspect`) was only found when forced to test on live.

Both cases had the same root cause: **no real verification before declaring done**.

---

## Requirements

### Delivery Checklist (enforced by PM/orchestrator)

Every task — before being marked done — must pass ALL of the following:

1. **API verification**: If the task involves an API endpoint, call it with `curl` and verify the response contains correct, non-empty data. Don't trust that "no error" means "working".

2. **Screenshot review**: Run Playwright tests, then **visually inspect** the screenshots. Verify the feature is visible with real data — not just that the test didn't throw an error. If a column should show an IP, confirm the IP is in the screenshot.

3. **Live testing for user-reported bugs**: If a user reported a specific URL or scenario, test that exact URL on the live server (`http://pablo-home-linux.tailf79837.ts.net:8080/`). Dev-only testing is insufficient when the data doesn't exist in dev.

4. **Report with proof**: Generate the HTML/PDF report with embedded screenshots. The report must show the feature working — not just the page loading.

5. **External API integration tests**: When integrating with external APIs (Tailscale, Kamatera, etc.), verify the raw API response first before testing the frontend. If the API returns empty data, investigate before proceeding.

### Agent Workflow Improvements

- **QA agent must validate data, not just page loads**: QA tests should assert on actual content (e.g., "Tailscale IP column contains 100.x.x.x"), not just element visibility.
- **PM must review QA screenshots before closing**: The orchestrator should read the screenshot PNGs and confirm the feature is visually correct before marking done.
- **Backend agent must verify deployment**: After deploying via MCP, call the endpoint with curl and confirm real data flows through. Don't stop at "deployment successful".

---

## Acceptance Criteria

- [ ] Documented delivery checklist added to CLAUDE.md or a standard operating procedure file
- [ ] QA test templates updated to include data assertions (not just element visibility)
- [ ] PM workflow includes mandatory screenshot review step
- [ ] Backend deployment workflow includes mandatory curl verification step
- [ ] Process tested on at least one real task end-to-end

---

## Notes

This is a process improvement task, not a code task. The goal is to establish a reliable multi-agent delivery workflow so tasks are truly done when marked done.
