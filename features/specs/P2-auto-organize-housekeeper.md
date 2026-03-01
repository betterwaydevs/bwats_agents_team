# P2: Auto-Organize Housekeeper — Stage Moves Leaking Across Projects

**Priority**: High
**Type**: BACK
**Project**: bwats_xano

## Problem

The housekeeper (`auto_organize`) moves people to stages in Project B because they had outbound/touchpoints in Project A. Root issue: our logic treats outbound/touchpoints as global person activity instead of project-scoped activity.

## Phase 1: Research + Requirements

### 1. Read the Code + Logic
- Inspect housekeeper auto_organize movement logic
- Identify every place where we check: outbound tasks, touchpoints, "contacted", "follow-up needed", replies, etc.
- For each check, confirm whether it filters by `project_id` (or equivalent join) or if it's global

### 2. Map the Data Model Reality
- Confirm where touchpoints live and what fields they have
- **Critical**: do touchpoints reliably store `project_id` today? If not, how can project be inferred (if at all)?
- List related tables/entities: person↔project join, outbound tasks, touchpoints, messages, LinkedIn connection, etc.
- Check if dev/v1 differ

### 3. Pull Concrete Failing Examples
- From logs and/or reports: collect 10–20 person_ids that moved incorrectly
- For each example, document:
  - Which project pipeline they were in
  - What stage they moved from/to
  - What "evidence" triggered it (outbound/touchpoint from another project, etc.)
- Use endpoint logs: dev 39456 and v1 39708

### 4. Propose a Safe Scoping Solution for Touchpoints
We need a plan that deals with legacy touchpoints that might not have project info.

Evaluate options and recommend one:
- **Preferred direction**: introduce `touchpoint.scope` (PROJECT vs GLOBAL_UNSCOPED) and enforce: only PROJECT-scoped evidence can move stages
- Enforce new touchpoints created in a project view must store `project_id`
- Suggest a conservative backfill heuristic ONLY when confidence is high; otherwise keep unscoped
- Explicitly state what happens when evidence is unscoped: it can show in UI, but must not drive stage movement

### 5. Frontend Requirements
- In project pipeline UI, clearly display whether outbound/touchpoints are for this project vs other project vs unscoped
- Default views should filter to "this project only", with an optional "show cross-project history"
- Make sure badges like "Contacted / Follow-up needed" are computed per project, not global

## Acceptance Criteria
- [ ] AC1: All auto_organize stage movement logic is project-scoped (no cross-project leaking)
- [ ] AC2: Only PROJECT-scoped evidence (touchpoints with matching project_id) can drive stage movement
- [ ] AC3: Unscoped/global touchpoints visible in UI but don't trigger stage moves
- [ ] AC4: Badges (Contacted, Follow-up needed, etc.) computed per project
- [ ] AC5: No silent failures — errors logged with person ID and reason
- [ ] AC6: Verified on both dev and v1

## References
- Dev task ID: 398, endpoint 39456
- V1 task ID: 414, endpoint 39708
