# M8: Delivery Supervisor Agent

**Priority**: High
**Type**: TEAM
**Project**: team (workspace-level)
**Status**: pending

## Problem

The multi-agent delivery pipeline (PM → DEV → QA → PO → User) is only as good as the discipline of each agent. Currently:
- PM might assign tasks without clear acceptance criteria
- DEV might skip self-testing or mark incomplete work as done
- QA might do code-review-only testing instead of real execution
- PO might approve without verifying QA artifacts
- No automated enforcement of delivery log format and sign-off completeness

**We need an automated supervisor that reviews delivery logs after task completion and flags violations.**

## Solution

Create a **delivery-supervisor** agent that runs as a **post-task completion hook**. When a task is marked complete, the supervisor:

1. Reads the delivery log (`features/delivery/<TASK_ID>.md`)
2. Validates compliance with `features/DELIVERY_FORMAT.md`:
   - PM sign-off present and includes assignment
   - DEV sign-off present and includes implementation notes + proof of self-testing
   - QA sign-off present with execution date/time, per-AC results, artifacts
   - PO sign-off present with per-AC acceptance verdict
   - User approval status recorded
3. Checks for violations:
   - Missing sign-offs
   - QA testing is code-review-only (no real execution)
   - QA report missing date/time
   - PO approval without reviewing QA artifacts
   - DEV claiming completion without deployment/testing proof
4. Generates a compliance report and appends it to the delivery log
5. If violations found, sets task status back to `in-progress` and notifies the orchestrator

## Architecture

### Hook Integration
- **Trigger**: Post-task completion (when BACKLOG.md status changes to `done`)
- **Location**: `.claude/hooks/post-task-complete.sh`
- **Action**: Launches `delivery-supervisor` agent with task ID

### Agent Definition
- **Name**: `delivery-supervisor`
- **Location**: `.claude/agents/delivery-supervisor.md`
- **Model**: `haiku` (cost-efficient for structured validation)
- **Tools**: `Read`, `Edit`, `Grep`, `Bash` (git operations)
- **Inputs**: Task ID
- **Outputs**: Compliance report appended to delivery log

### Validation Rules

The supervisor enforces these rules from MEMORY.md and CLAUDE.md:

1. **PM Sign-off**:
   - ✅ Must have `## PM: Assignment` section
   - ✅ Must include assigned agents
   - ✅ Must reference spec file

2. **DEV Sign-off**:
   - ✅ Must have `## DEV: Implementation` section
   - ✅ Must include implementation notes
   - ✅ Must include proof of self-testing (curl output, screenshots, test logs)
   - ✅ Must note deployment location (dev/live)

3. **QA Sign-off**:
   - ✅ Must have `## QA: Testing` section
   - ✅ Must include execution date and time
   - ✅ Must have per-AC test results (PASS/FAIL)
   - ✅ Must include artifacts (test reports, screenshots, curl outputs)
   - ❌ REJECT if only "code review" or "static analysis" mentioned
   - ❌ REJECT if no real execution evidence

4. **PO Sign-off**:
   - ✅ Must have `## PO: Acceptance` section
   - ✅ Must reference QA artifacts reviewed
   - ✅ Must have per-AC acceptance verdict
   - ✅ Must have final recommendation (approve/reject)

5. **User Approval**:
   - ✅ Must have `## User: Approval` section
   - ✅ Status can be `pending`, `approved`, or `rejected`

### Example Compliance Report

```markdown
## Supervisor: Compliance Check

**Date**: 2026-03-01 14:23:00
**Task**: M8
**Reviewer**: delivery-supervisor (haiku)

### Validation Results

✅ PM sign-off complete
✅ DEV sign-off complete
❌ QA sign-off INVALID: No execution date/time found
❌ QA sign-off INVALID: Testing appears to be code-review-only (no curl/test execution logs)
✅ PO sign-off complete
⚠️  User approval pending (expected)

### Violations

1. **QA Testing**: Line 47 states "reviewed code for correctness" but no execution tests were run. DELIVERY_FORMAT.md requires real execution against dev environment.
2. **QA Report**: Missing timestamp of test execution.

### Recommendation

**REJECT** — Task status reverted to `in-progress`. QA must re-test with real execution and provide dated report.

### Actions Taken

- Reverted BACKLOG.md status: `done` → `in-progress`
- Appended compliance report to delivery log
- Notified orchestrator: requires QA re-work
```

## Implementation Plan

### Phase 1: Hook Setup
- [ ] Create `.claude/hooks/` directory
- [ ] Write `post-task-complete.sh` that:
  - Detects when BACKLOG.md changes (via git diff)
  - Extracts task ID from changed line
  - Launches `delivery-supervisor` agent with task ID
- [ ] Test hook manually with a sample task

### Phase 2: Agent Creation
- [ ] Create `.claude/agents/delivery-supervisor.md` with:
  - Validation rules (from above)
  - Instruction to read DELIVERY_FORMAT.md
  - Instruction to append compliance report
  - Instruction to revert task status if violations found
- [ ] Test agent on existing delivery logs (M1, M2, M3, M10)

### Phase 3: Integration
- [ ] Configure hook in `.claude/settings.local.json` (if needed)
- [ ] Update CLAUDE.md to document supervisor workflow
- [ ] Update MEMORY.md with supervisor learnings
- [ ] Run full test: mark a task done → verify supervisor runs → verify violations caught

### Phase 4: Backlog Integration
- [ ] Run supervisor on all `dev-complete` tasks in BACKLOG.md
- [ ] Generate compliance reports for each
- [ ] Identify which tasks need re-work before User approval

## Acceptance Criteria

### AC1: Hook Triggers on Task Completion
**Given** a task is marked `done` in BACKLOG.md
**When** the change is committed
**Then** the `post-task-complete.sh` hook automatically runs
**And** launches the `delivery-supervisor` agent with the task ID

### AC2: Supervisor Validates PM Sign-off
**Given** a delivery log for task X
**When** the supervisor reviews it
**Then** it checks for presence of `## PM: Assignment` section
**And** verifies assigned agents are listed
**And** flags violation if missing

### AC3: Supervisor Validates DEV Sign-off
**Given** a delivery log for task X
**When** the supervisor reviews it
**Then** it checks for `## DEV: Implementation` section
**And** verifies self-testing proof is present (logs, outputs, screenshots)
**And** flags violation if missing

### AC4: Supervisor Rejects Code-Review-Only QA
**Given** a delivery log where QA section says "code review" or "static analysis"
**When** the supervisor reviews it
**Then** it flags a violation: "QA testing must be real execution, not code review"
**And** marks the task for re-work

### AC5: Supervisor Validates QA Execution Evidence
**Given** a delivery log for task X
**When** the supervisor reviews the QA section
**Then** it checks for execution date and time
**And** checks for per-AC test results (PASS/FAIL)
**And** checks for artifacts (test reports, curl outputs, screenshots)
**And** flags violation if any are missing

### AC6: Supervisor Validates PO Acceptance
**Given** a delivery log for task X
**When** the supervisor reviews the PO section
**Then** it checks that QA artifacts were reviewed
**And** verifies per-AC acceptance verdict is present
**And** flags violation if missing

### AC7: Supervisor Appends Compliance Report
**Given** the supervisor completes validation
**When** violations are found
**Then** it appends a `## Supervisor: Compliance Check` section to the delivery log
**And** lists all validation results (✅/❌)
**And** provides detailed violation descriptions
**And** gives a final recommendation (ACCEPT/REJECT)

### AC8: Supervisor Reverts Status on Violations
**Given** the supervisor finds violations
**When** it completes the compliance check
**Then** it reverts the task status in BACKLOG.md from `done` to `in-progress`
**And** commits the change with message "Supervisor: M8 reverted due to delivery violations"

### AC9: Supervisor Accepts Compliant Deliveries
**Given** a delivery log that passes all validation rules
**When** the supervisor reviews it
**Then** it appends a compliance report with all ✅
**And** recommendation: ACCEPT
**And** leaves the task status as `done`
**And** notes "Ready for User approval"

### AC10: Supervisor Self-Documents
**Given** the supervisor runs
**When** it completes
**Then** the compliance report includes:
  - Date and time of review
  - Task ID reviewed
  - Agent name and model (delivery-supervisor / haiku)
  - Summary of actions taken (status changes, notifications)

## Dependencies

- `features/DELIVERY_FORMAT.md` (canonical format)
- `features/BACKLOG.md` (task tracking)
- `features/delivery/<ID>.md` (delivery logs)
- `.claude/settings.local.json` (hook configuration)
- CLAUDE.md orchestrator rules (sign-off requirements)
- MEMORY.md (delivery pipeline rules)

## Testing Plan

### Test 1: Compliant Delivery (M10)
- M10 has full PM/DEV/QA/PO sign-offs with real execution tests
- Expected: Supervisor ACCEPTS, status stays `done`

### Test 2: Missing QA Execution (mock)
- Create mock delivery log with QA saying "code reviewed"
- Expected: Supervisor REJECTS, status reverted to `in-progress`

### Test 3: Missing PO Acceptance (mock)
- Create mock delivery log without PO section
- Expected: Supervisor REJECTS, flags missing PO sign-off

### Test 4: Hook Trigger
- Mark a test task as `done` in BACKLOG.md
- Expected: Hook auto-runs supervisor, compliance report added

## Rollout Plan

1. **Week 1**: Build hook + agent, test on mock data
2. **Week 2**: Run supervisor on all `dev-complete` tasks, generate compliance reports
3. **Week 3**: Integrate into standard workflow, update documentation
4. **Week 4**: Monitor for 10 task completions, refine validation rules based on findings

## Success Metrics

- ✅ 100% of completed tasks have compliance reports
- ✅ 0 tasks marked `done` without valid QA execution tests
- ✅ 0 tasks marked `done` without all 4 sign-offs (PM/DEV/QA/PO)
- ✅ Supervisor runs automatically within 5 seconds of task completion
- ✅ False positive rate < 5% (valid deliveries incorrectly rejected)

## Future Enhancements

- Slack/email notifications when violations found
- Dashboard integration (W1 Phase 3) — show compliance status per task
- Supervisor learning: suggest improvements to agents based on common violations
- Pre-delivery validation: run supervisor before PO sign-off to catch issues early
