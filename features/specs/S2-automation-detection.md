# S2: Extension Automation Detection Test Rig

**Priority**: High
**Type**: EXT
**Projects**: bw_cold_recruiting, linked_communication

## Problem

Our Chrome extensions automate clicks and navigation on LinkedIn. We don't know what detection footprint they leave — synthetic event flags, stack trace leaks, CSP violations, timing anomalies. Need a local test rig to measure this before we get flagged.

## Overview

Build a local test website + test extension that runs our production automation logic against a detection engine. Dashboard shows pass/warn/fail per check. Iterative: fix one signal at a time, re-test, compare.

## Architecture

- **Test Website** (localhost:3000) — Static HTML + vanilla JS, detection engine, real-time dashboard, JSON export
- **Test Extension** — Uses production-identical click/navigation logic, "Run Test" button
- **Results Channel** — In-page console, visual dashboard, JSON report export + diff tool

## Detection Categories (6)

1. **JS Runtime Integrity** — Native function tampering, prototype pollution, property descriptors
2. **Event Trust & Origin** — `event.isTrusted`, pointer event consistency, event sequencing
3. **Timing & Call Stack Anomalies** — Zero-delay chains, extension URLs in stacks, async boundaries
4. **CSP Consistency** — Policy violation events, forbidden execution detection
5. **Automation Flags** — `navigator.webdriver`, Chrome API presence, permissions API
6. **Extension Artifacts** — Global namespace pollution, content script leaks, resource timing

## Phases

### Phase 1: MVP
- Basic HTML test page with test elements (normal button, shadow DOM, dynamic, SPA nav, iframe)
- 3-5 core detection checks (isTrusted, automation flags, CSP)
- Simple dashboard UI
- Extension test button
- Console logging

### Phase 2: Core Detection
- All event authenticity checks
- Call stack inspection
- CSP tripwires
- JSON export + baseline comparison script

### Phase 3: Polish
- Visual dashboard improvements
- Shadow DOM + iframe tests
- Timing analysis
- Automated report diffing
- Documentation

## Testing Methodology

1. **Baseline** — Manual clicks, no extension → all checks pass
2. **Passive Extension** — Extension installed but not activated → should match baseline
3. **Active Automation** — Extension clicks programmatically → identify failures
4. **Iterate** — Fix one signal, re-test, diff results

## Acceptance Criteria

- [ ] AC1: Test website runs on localhost with detection engine
- [ ] AC2: Dashboard shows real-time pass/warn/fail per check
- [ ] AC3: Detects `event.isTrusted === false` on automated clicks
- [ ] AC4: Identifies extension URLs in call stack traces
- [ ] AC5: Catches CSP violations from extension injection
- [ ] AC6: JSON export with full details, diffable between runs
- [ ] AC7: Zero false positives on manual interaction
- [ ] AC8: 20+ distinct detection checks implemented

## References

- Full plan: `/home/pablo/projects/extention_detection/AUTOMATION_DETECTION_PLAN.md`
- Deep dive parts: `AUTOMATION_DETECTION_TECHNICAL_DEEP_DIVE.md` (parts 1-3)
- Date: 2026-02-03
