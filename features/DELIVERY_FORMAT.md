# Delivery Format Specification

All agents MUST follow this format when writing delivery logs. Delivery logs live in `features/delivery/<ID>.md` where `<ID>` matches the task ID from the backlog (e.g., `M9`, `P4`, `L2`).

## File Structure

Each delivery file starts with a title header and contains one or more stage sections:

```markdown
# <ID>: Delivery Log

## ROLE: Label
- **Status**: pending | in-progress | done | blocked
- **Agent**: agent-name
- **Date**: YYYY-MM-DD
- **Notes**: Free text describing what was done or what's needed
- **Commits**: repo@hash, repo@hash
- **Screenshots**: filename1.png, filename2.png
- **Report**: filename.html
```

## Stage Types

| Stage Header | Role | Agent | When Written |
|---|---|---|---|
| `## PM: Assignment` | PM | project-manager | When task is assigned to developers |
| `## DEV: Backend` | DEV | backend-developer | When backend work starts/completes |
| `## DEV: Frontend` | DEV | frontend-developer | When frontend work starts/completes |
| `## DEV: Extension` | DEV | chrome-ext-developer | When extension work starts/completes |
| `## DEV: Python` | DEV | python-developer | When Python work starts/completes |
| `## QA: Testing` | QA | qa-tester | When testing starts/completes |
| `## PO: Acceptance` | PO | product-owner | When verifying acceptance criteria |
| `## User: Approval` | User | (user via dashboard) | Final approval gate |

## Required Fields

- **Status** (required): `pending`, `in-progress`, `done`, or `blocked`
- **Agent** (required): The agent name that owns this stage
- **Date** (required): Date in `YYYY-MM-DD` format (set when status changes to `in-progress` or `done`)

## Optional Fields

- **Notes**: Free text. What was done, what was found, any context.
- **Commits**: Comma-separated `repo@hash` entries (e.g., `bwats_xano@abc1234, nearshore-talent-compass@def5678`)
- **Screenshots**: Comma-separated filenames stored in the test screenshots directory (e.g., `m9-notification-badge.png, m9-dropdown-open.png`)
- **Report**: Single filename for a test report (e.g., `m9-test-report.html`)

## Which Stages Per Task Type

Not every task needs all stages. Use what's relevant:

| Task Type | Stages |
|---|---|
| BACK | PM → DEV:Backend → QA → PO → User |
| FRONT | PM → DEV:Frontend → QA → PO → User |
| BOTH | PM → DEV:Backend → DEV:Frontend → QA → PO → User |
| EXT | PM → DEV:Extension → QA → PO → User |
| TEST | PM → QA → PO → User |

## Stage Dependency Rules

Each stage has prerequisites that MUST be satisfied (status `done`) before it can begin. Agents MUST NOT start work on a stage unless all its prerequisites are met.

| Stage | Prerequisites |
|---|---|
| `PM: Assignment` | None (first stage) |
| `DEV: Backend` | `PM: Assignment` must be `done` |
| `DEV: Frontend` | `PM: Assignment` must be `done` |
| `DEV: Extension` | `PM: Assignment` must be `done` |
| `DEV: Python` | `PM: Assignment` must be `done` |
| `QA: Testing` | ALL `DEV:*` stages in the task must be `done` |
| `PO: Acceptance` | `QA: Testing` must be `done` |
| `User: Approval` | `PO: Acceptance` must be `done` |

**Parallel DEV stages**: When a task has multiple DEV stages (e.g., `DEV: Backend` + `DEV: Frontend`), they may run in parallel after `PM: Assignment` is done. However, QA cannot begin until ALL of them are complete.

## Proof Requirements Per Stage

Each stage type has specific proof artifacts that agents MUST provide when marking the stage `done`. Missing proof means the stage is not truly complete.

### DEV Stages (Backend, Frontend, Extension, Python)

| Field | Required? | Details |
|---|---|---|
| **Commits** | Required | At least one `repo@hash` entry proving code was committed |
| **Notes** | Required | Must include self-test proof — what the developer tested and the outcome (e.g., "Verified endpoint returns 200 with correct payload", "Confirmed UI renders correctly in browser") |
| **Screenshots** | Optional | Helpful for frontend/UI work but not mandatory for DEV stages |

### QA: Testing

| Field | Required? | Details |
|---|---|---|
| **Screenshots** | Required | Visual proof of tested functionality |
| **Report** | Required | Test report file stored in `features/reports/<ID>/` (e.g., `features/reports/M9/test-report.html`). Can be any format (HTML, JSON, text). |
| **Notes** | Required | Must include per-criterion PASS/FAIL results mapped to the acceptance criteria from the spec. Example: "AC1: Badge shows count — PASS", "AC2: Dropdown lists notifications — PASS" |

### PO: Acceptance

| Field | Required? | Details |
|---|---|---|
| **Notes** | Required | Must include a per-AC verdict for every acceptance criterion in the spec. Example: "AC1: PASS — badge correctly displays unread count", "AC2: PASS — dropdown shows all notifications" |
| **Screenshots** | Optional | Only if the PO spots issues or wants to document specific behavior |

### User: Approval

| Field | Required? | Details |
|---|---|---|
| **Status** | Required | Updated via the dashboard approve/reject buttons. No other fields needed from agents. |

## Blocking Rule

If any stage is set to `blocked`, all downstream stages (per the dependency chain above) are **automatically considered blocked**. Work must flow backwards to resolve the issue before the pipeline can proceed.

**How blocking works:**
1. An agent or user sets a stage to `blocked` (with Notes explaining why)
2. All stages that depend on the blocked stage cannot proceed, regardless of their current status
3. The responsible agent for the blocked stage must fix the issue and return the stage to `in-progress` → `done`
4. Only after the blocked stage is resolved can downstream stages resume

**Example:** If `QA: Testing` is set to `blocked` because tests fail, then `PO: Acceptance` and `User: Approval` cannot proceed. The developer must fix the issue (their DEV stage goes back to `in-progress`), QA re-tests, and only then can the pipeline continue.

## Agent Workflow

### When starting work on a task:

1. Check if `features/delivery/<ID>.md` exists
2. If not, create it with the title header and your stage
3. If yes, append your stage section
4. Set your stage status to `in-progress` with today's date

### When completing work:

1. Update your stage status from `in-progress` to `done`
2. Fill in `Notes` with a summary of what was done
3. Add `Commits` if you made git commits
4. Add `Screenshots` if you captured any
5. Add `Report` if you generated a test report

### When re-doing work after feedback (CRITICAL):

When the user or another agent requests changes, you MUST update your delivery stage to reflect the latest state:

1. Set your stage status back to `in-progress`
2. **Replace** your `Notes` with the latest summary — do NOT keep old notes. The delivery log must reflect current state, not history.
3. **Replace** your `Screenshots` with new filenames — old screenshots are stale and misleading. Capture fresh ones that show the fixed behavior.
4. **Replace** your `Report` with a new report filename — regenerate the report so it reflects the current state.
5. **Append** new commit hashes to `Commits` (these are additive).
6. When the fix is verified, set status back to `done` with the current date.

**The delivery log is a live status board, not a history log.** Progress history belongs in `features/progress/<ID>.md`. The delivery log must always show the latest state of each stage so the dashboard displays current, accurate information.

### User: Approval Stage

Always include `## User: Approval` as the last stage with status `pending`. This is updated via the dashboard UI, not by agents.

## Screenshot Naming Convention

`{task-id-lowercase}-{description}.png`

Examples:
- `m9-notification-badge.png`
- `m9-dropdown-open.png`
- `p4-profile-fallback.png`

## Example File

See `features/delivery/M9.md` for a complete example.
