# QF16 — Scoring Agent Reliability & Router Integration Fix

> **Priority**: High | **Type**: BACK | **Status**: pending
> **Projects**: bwats_xano (backend)

## Problem

The scoring agent has multiple reliability issues causing 100% failure rate when invoked from the prospect router:

### Issue 1: `call_scoring_agent` tool missing `person_data` (ROOT CAUSE)

The scoring agent was upgraded to v3 ("pre-fetched person data" architecture):
- The agent's prompt expects `$args.person_data` containing the full person profile
- The agent's tool list was stripped to only 2 tools: `get_project` and `change_person_project_association_stage_info`
- The agent can no longer fetch person data itself

But the `call_scoring_agent` tool (#271, used by the Router Agent) was never updated. It only passes `project_id`, `person_type`, `person_id`, `association_id` — no `person_data`. The agent receives null person data and has no tools to fetch it, causing a fatal error.

The shared function `call_score_agent` (functions/agents/9394) does it correctly — it calls `get_all_person_data` first and passes the result. But the Router uses the tool, not the function.

### Issue 2: Scheduled task `auto_score_agent` also broken

The scheduled task `tasks/148_auto_score_agent.xs` has its own inline `ai.agent.run` that also does NOT pre-fetch person data — same problem as the tool. It also has a bug where it builds the pending task list twice (first capped at 1, then appended again capped at 5).

### Issue 3: Router doesn't fail on scoring failure

When `call_scoring_agent` fails for a project, the Router Agent just marks that project as "FAILED" and moves on to the next one. If ALL projects fail (as seen in the trace), the router reports success with 0 processed and 5 failed. There's no way to route without a score — the task should be marked as failed so it gets retried.

## Requirements

### R1 — Fix `call_scoring_agent` tool to pass `person_data`

Update `tools/271_call_scoring_agent.xs` to pre-fetch person data before invoking the agent. The tool should:
1. Call `function.run "persons/get_all_person_data"` with `person_id` and `person_type`
2. Pass the result as `person_data` in the agent args
3. This matches what the shared function `call_score_agent` already does

### R2 — Fix scheduled task `auto_score_agent`

Update `tasks/148_auto_score_agent.xs` to either:
- **Option A (preferred)**: Use the shared function `call_score_agent` instead of inline `ai.agent.run` (same pattern as `auto_route_agent` using `call_prospect_router`)
- **Option B**: Add `get_all_person_data` pre-fetch to the inline code

Also fix the double-loop bug in pending task list building.

### R3 — Router must fail the task when scoring fails

Update the Router Agent (`agents/54_person_router_agent.xs`) behavior:
- If `call_scoring_agent` returns a fatal error for ANY project, the router should still attempt remaining projects
- But if ALL scoring attempts fail (0 successful scores), the router must mark the overall task as **failed** (not success with 0 processed)
- The task result should clearly indicate scoring failure so the retry system picks it up
- Individual project failures should be logged but not block other projects from being attempted

### R4 — Verify scoring works end-to-end after fixes

After R1-R3 are implemented:
1. Test the Router Agent with a real prospect — scoring should succeed and return a `final_score`
2. Test the scheduled `auto_score_agent` task — should process a pending scoring task successfully
3. Test the failure case — if scoring genuinely fails (not due to missing data), the router should mark the task as failed

## Acceptance Criteria

- [ ] **AC1**: `call_scoring_agent` tool passes pre-fetched `person_data` to the scoring agent
- [ ] **AC2**: Scheduled task `auto_score_agent` either uses the shared function or correctly pre-fetches person data
- [ ] **AC3**: Double-loop bug in `auto_score_agent` is fixed
- [ ] **AC4**: Router Agent marks the task as failed when all scoring attempts fail
- [ ] **AC5**: End-to-end test: Router Agent invokes scoring via the tool, receives a valid `final_score`, and proceeds with stage changes

## Files to Modify

| File | Change |
|------|--------|
| `tools/271_call_scoring_agent.xs` | Add `get_all_person_data` pre-fetch, pass `person_data` to agent |
| `tasks/148_auto_score_agent.xs` | Switch to shared function OR add pre-fetch; fix double-loop |
| `agents/54_person_router_agent.xs` | Update prompt: fail task when all scores fail |

## Dependencies

- QF7 (function.run sweep) — DONE, prerequisite complete
- Scoring agent v3 definition (`agents/12_prospects_and_candidates_project_scorer.xs`) — no changes needed, the agent itself is correct

## References

- Scoring agent: `agents/12_prospects_and_candidates_project_scorer.xs` (canonical `Uwh_pMEH`)
- Router agent: `agents/54_person_router_agent.xs` (canonical `e2e4mR4U`)
- Broken tool: `tools/271_call_scoring_agent.xs`
- Correct shared function: `functions/agents/9394_call_score_agent.xs`
- Pre-fetch function: `functions/persons/10826_get_all_person_data.xs`
- Scheduled task: `tasks/148_auto_score_agent.xs`
- Failed trace: Angel Ortiz (prospect 71590), 5/5 scoring failures on 2026-03-03
