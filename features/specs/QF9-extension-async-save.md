# QF9: Backend Async Processing — Prospect Save Returns Fast

**Type**: BACK
**Priority**: Medium
**Owner**: backend-developer

---

## Problem

The Chrome extension saves invitations/connections by calling the Xano backend (e.g. `add_prospect` / `create_prospect_from_html`). These endpoints do a lot of synchronous work before returning — parsing, touchpoint creation, stage movement — which makes each call slow. The extension has to wait for each response before proceeding to the next record, causing the UI to block.

The fix does NOT belong in the extension. The extension should call the endpoint and move on. The backend should return quickly and defer heavy processing.

## Background

- `process_pending_prospects` (task #575 dev / #576 v1) already runs every 5 minutes and processes pending prospects asynchronously via `parse_unparsed_prospect`.
- The architecture already supports async processing — the backend just needs to return before doing the heavy work.
- There is also a question of whether the **stage movement logic** (moving a prospect through pipeline stages after save) is still needed, given that:
  - Auto-organize now handles stage assignment automatically
  - The extension already creates a prospect as soon as someone is invited

## Solution

### Step 1: Identify slow synchronous work in the save endpoints

Audit `add_prospect` and `create_prospect_from_html` on v1. Identify everything that happens synchronously after the initial `db.add`:
- Parsing (HTML → structured data)
- Touchpoint creation
- Stage movement / pipeline progression
- Any other blocking operations

### Step 2: Evaluate stage movement necessity

Determine whether the stage movement logic is still needed:
- If auto-organize already handles stage assignment → remove it from the save endpoint
- If it's still needed → move it to `parse_unparsed_prospect` (async, handled by the scheduled task)

### Step 3: Make the endpoint return fast

After `db.add` (record saved), return the response immediately. Any remaining processing should either:
- Be handled by the scheduled `process_pending_prospects` task (already running every 5 min), OR
- Be triggered via a non-blocking background call

The endpoint should return the new prospect ID/record within < 500ms.

## Acceptance Criteria

| # | Criteria |
|---|----------|
| AC1 | `add_prospect` (and/or `create_prospect_from_html`) on v1 returns a response within 500ms after saving the record |
| AC2 | Heavy processing (parsing, touchpoint creation, stage movement) happens asynchronously — either via the scheduled task or a non-blocking trigger — NOT synchronously in the save endpoint |
| AC3 | Stage movement logic is evaluated: if redundant given auto-organize, it is removed; if still needed, it is deferred to async processing |
| AC4 | The extension does not need any changes — same API call, just gets a faster response |
| AC5 | No data loss — records saved via the fast endpoint are eventually fully processed (parsed, touchpoints created) by the async pipeline |

## Key Files (backend)

- `bwats_xano/apis/prospects/` — `add_prospect` endpoint
- `bwats_xano/apis/prospects/` — `create_prospect_from_html` endpoint
- `bwats_xano/functions/` — `parse_unparsed_prospect` function
- Scheduled task `process_pending_prospects` (#575 dev / #576 v1)

## Also Required: Revert Extension Changes

The previous QF9 implementation made changes to the `linked_communication` extension that should be reverted:
- `popup.js`, `sidepanel.js`, `content-capture.js`, `background.js` were modified
- Version was bumped to 1.20.5
- These changes should be reverted to the state before QF9 and the version decremented

## Notes

- The backend-developer must read `../bwats_xano/CLAUDE.md` before making any changes
- All Xano MCP writes must go through `xano-branch-guard` first
- Test response time on v1 (not just dev — dev can be slower due to cold starts)

## 2026-03-05 Scope Correction

The effective scope for the correction cycle is:
- `create_linkedin_invitation` (API `16924`, group `linkedin`, canonical `mIBuuXC3`)
- `create_linkedin_connections` (API `16921`, group `linkedin`, canonical `mIBuuXC3`)

Required behavior for correction:
- Record invitation/connection idempotently by `(user_id, Connection_Profile_URL)`.
- Return dedupe indicators (`inserted`, `already_exists`) instead of duplicate fatal errors.
- Do not trigger stage movement in these save endpoints.

## Current Issues

- Runtime mismatch was reproduced in development before republish (old behavior present).
- Endpoints were then republished to Xano development, but QA runtime calls with the current test credential now return `403 ERROR_CODE_ACCESS_DENIED`.
- Because of `403`, functional acceptance criteria for insert/dedupe behavior cannot be verified with that credential.

## Pending

- Run runtime QA with a permitted user token that has access to `mIBuuXC3` development endpoints.
- Re-execute timed insert + duplicate batches for both endpoints (10 calls each).
- Confirm expected response contract:
  - HTTP success on valid requests
  - `inserted=true` for first insert
  - `already_exists=true` for duplicate calls
  - no stage movement side effects in endpoint response
- If all pass, update `features/delivery/QF9.md` correction stages from `blocked` to `done`.
