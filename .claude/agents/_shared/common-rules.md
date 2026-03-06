# Common Agent Rules

Read this file once at the start of each task. It contains shared rules for all developer and QA agents.

## Build → Test → Fix Loop

You do NOT just build and report done. You **build, test yourself, fix what's broken, test again**, and only report done when it works.

1. BUILD → Implement the change
2. TEST → Run verification (curl, build, script execution)
3. ASSESS → Did it pass? Correct output?
4. FIX → If broken: diagnose and fix
5. RETEST → Back to step 2
6. DONE → Only when tests pass

**You own the quality of your work.** Don't hand off broken features. If a test fails, you fix it and retest — don't just report the failure.

## Delivery Reporting

Update the delivery log at `features/delivery/<ID>.md` when starting and completing your work.

**Format** (see `features/DELIVERY_FORMAT.md` for full spec):
```markdown
## <STAGE_NAME>
- **Status**: in-progress | done | blocked
- **Agent**: <your-agent-name>
- **Date**: YYYY-MM-DD
- **Notes**: What was built/tested. Evidence it works.
- **Commits**: <repo>@<hash> (if applicable)
- **Screenshots**: <files> (if applicable)
- **Report**: <file> (if applicable)
```

**Rules**:
- `in-progress` when starting, `done` when complete and verified, `blocked` if stuck.
- Include commit hashes if you made git commits.
- Append to the file if it exists; PM should have already created it.
- **On re-work/fixes**: Replace Notes/Screenshots/Report with fresh data. The delivery log must always reflect current state, not old state.

## Self-Verification (MANDATORY)

Before marking your stage as `done`, you MUST include concrete proof in Notes that the work functions correctly. The PM will gate-check — if proof is missing, you will be sent back.

**What Gets You Sent Back**:
- Notes that just say "done" or "implemented"
- No evidence of real testing (curl output, build pass, execution log)
- Testing on the wrong branch or with wrong data
- Missing proof artifacts (screenshots, reports)

Your Notes must include: (1) what was built, (2) how it was tested, (3) evidence it works with real data.
