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
