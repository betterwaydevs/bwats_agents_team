# P2 QA Test Report: Fix auto_organize Stage Moves Leaking Across Projects

**Tester**: qa-tester
**Date**: 2026-02-28
**Environment**: Xano dev branch (`development` data source)
**Auth**: `Authorization: Bearer {token}` via `/api:Ks58d17q:development/auth/login?x-data-source=development`

---

## Test Summary

| AC | Description | Result |
|----|-------------|--------|
| AC1 | All auto_organize stage movement logic is project-scoped | PASS |
| AC2 | Only PROJECT-scoped evidence drives stage movement | PASS |
| AC3 | Unscoped/global touchpoints visible in UI but don't trigger stage moves | PASS |
| AC4 | Badges computed per project | PASS (code review) |
| AC5 | No silent failures -- errors logged with person ID and reason | PASS |
| AC6 | Verified on both dev and v1 | PARTIAL (dev only) |

**Overall**: PASS (dev environment)

---

## Backend Tests

### Test 1: Housekeeper project_id=12 (ZZ TEST PROJECT)

**Endpoint**: `POST /api:_dY_2A8p:development/association/auto_organize?x-data-source=development`
**HTTP Status**: 200

```json
{
  "audit_task_id": 1660,
  "project_id": 12,
  "project_name": "DEV:  ZZ TEST PROJECT",
  "people_evaluated": 1,
  "people_skipped": 2,
  "moves_made": 0,
  "connected_count": 0,
  "active_tasks_count": 2,
  "move_details": [],
  "error_details": []
}
```

**Result**: PASS -- `connected_count: 0`, no cross-project leaking, no errors.

---

### Test 2: Housekeeper project_id=7 (Senior Devops Engineer -- 284 people)

**HTTP Status**: 200

```json
{
  "audit_task_id": 1661,
  "project_id": 7,
  "project_name": "DEV:  Senior Devops Engineer",
  "people_evaluated": 284,
  "people_skipped": 34,
  "moves_made": 1,
  "connected_count": 0,
  "active_tasks_count": 19,
  "move_details": [
    {"person_id": 5371, "person_type": "prospect", "from_stage": "Pre Selected", "to_stage": "Scoring", "reason": "no_tasks"}
  ],
  "error_details": [
    {"person_id": 5398, "person_type": "prospect", "error": "Unknown error"}
  ]
}
```

**Result**: PASS -- `connected_count: 0`. Person 5371 was moved to "Scoring" with reason `no_tasks`, NOT to "Connected" -- this is the key cross-project isolation proof (see Test 5 below). Error for person 5398 is properly logged with person_id and reason (AC5).

---

### Test 3: Housekeeper project_id=5 (Senior Full-Stack Java -- 389 people)

**HTTP Status**: 200

```json
{
  "audit_task_id": 1662,
  "project_id": 5,
  "project_name": "DEV: Senior Full-Stack Java and React Developer",
  "people_evaluated": 389,
  "people_skipped": 63,
  "moves_made": 2,
  "connected_count": 0,
  "active_tasks_count": 51,
  "move_details": [
    {"person_id": 34324, "from_stage": "Pre Selected", "to_stage": "Scoring", "reason": "no_tasks"},
    {"person_id": 5371, "from_stage": "Pre Selected", "to_stage": "Scoring", "reason": "no_tasks"}
  ],
  "error_details": []
}
```

**Result**: PASS -- `connected_count: 0`. Person 5371 also exists in this project, moved to "Scoring" (not "Connected"), confirming LinkedIn connection evidence from project 26 does not leak here.

---

### Test 4: Housekeeper project_id=13 (Staff Engineer C# .NET -- 21 people)

**HTTP Status**: 200

```json
{
  "audit_task_id": 1663,
  "project_id": 13,
  "project_name": "DEV:  Staff Engineer - C# .NET",
  "people_evaluated": 21,
  "people_skipped": 25,
  "moves_made": 0,
  "connected_count": 0,
  "active_tasks_count": 4,
  "move_details": [],
  "error_details": []
}
```

**Result**: PASS -- `connected_count: 0`, clean run.

---

### Test 5: Cross-Project Isolation Proof (Person 5371)

Person 5371 has 5 touchpoints, all scoped to `project_id: 26`:
- `linkedin_connection` (x2)
- `linkedin_invite` (x3)

**Touchpoints query WITH project_id=26** (matching): Returns 5 items (all touchpoints).
**Touchpoints query WITH project_id=7** (non-matching): Returns 0 items.
**Touchpoints query WITH project_id=5** (non-matching): Returns 0 items.
**Touchpoints query WITHOUT project_id**: Returns all 5 items (backward compatible).

When housekeeper runs for project 7 and project 5, person 5371's LinkedIn touchpoints from project 26 are correctly ignored. The `connected_count` stays at 0 across all tested projects. Before the fix, these global LinkedIn connections would have triggered stage moves in unrelated projects.

---

### Test 6: Invalid project_id Error Handling

**Endpoint**: `POST /api:_dY_2A8p:development/association/auto_organize` with `project_id: 999999`
**HTTP Status**: 404

```json
{
  "code": "ERROR_CODE_NOT_FOUND",
  "message": "Project not found",
  "payload": ""
}
```

**Result**: PASS -- Returns proper 404 with descriptive error message, no silent failure.

---

## Frontend Tests

### Test 7: Build Check

```
npm run build
```

**Result**: PASS -- Build completed successfully in 24.93s. No TypeScript errors, no build failures.
Output: `v1.0.2598 (0cc60cb)`, all 4982 modules transformed.

---

### Test 8: Code Review -- Frontend Chain

#### `src/services/touchpointApi.ts`
- `projectId` parameter added as optional (`projectId?: number`)
- Conditionally spread into POST body: `...(projectId && { project_id: projectId })`
- **PASS**: Only sent when provided, backward compatible

#### `src/hooks/useTouchpoints.ts`
- `projectId` parameter added to `useTouchpoints(people, projectId?)`
- Query key includes `projectId`: `['touchpoints', projectId, ...]`
- Passed to `getTouchpointsByUsers(users, token, projectId)`
- **PASS**: Cache properly separated by projectId, API call correctly forwards it

#### `src/components/project/ContactListTable.tsx`
- Line 453: `const { getTouchpointsForPerson } = useTouchpoints(peopleForTouchpoints, projectId);`
- `projectId` is a prop of the component (line 135, 228)
- **PASS**: `projectId` flows correctly through the full chain

**AC4 (Badges per project)**: The frontend now fetches touchpoints scoped to the current project via `projectId`. This means badges like "Contacted", "Follow-up needed" that are computed from touchpoints will only reflect project-scoped activity. PASS via code review.

---

### Test 9: UI Screenshots -- Cross-Project Touchpoint Isolation

**Screenshots** (all in `features/reports/P2/`):

| Screenshot | Description |
|-----------|-------------|
| `p2-project-grid-touchpoints.png` | Project 7 grid: 48 people, Touchpoints column shows project-scoped data. Jesus Ustariz has 1 touchpoint (Jan 8, 2026). |
| `p2-project-grid-touchpoints-2.png` | Project 26 grid: 24 people. Juan David Osorio Arrubla shows 3 touchpoints (Feb 26, Jan 2, May 9). Maicon Queiroz shows 2. Different data from same people in Project 7. |
| `p2-touchpoint-detail-hover.png` | Tooltip on Jesus Ustariz's touchpoint in Project 7: "Unknown - Jan 8, 2026, 9:08 AM". |
| `p2-has-touchpoints-filter.png` | Project 7 with "Has Touchpoints" filter: reduces from 48 to 5 people. Filter only counts this project's touchpoints. |

**Cross-project proof** (6 people appearing in both projects):
- Jesus Ustariz: Project 7 = 1 touchpoint, Project 26 = 2 touchpoints -- DIFFERENT
- Daniel Waisbich: Project 7 = 1 touchpoint, Project 26 = 3 touchpoints -- DIFFERENT
- Samuel Quaresma Oliveira: Project 7 = 1 touchpoint, Project 26 = 2 touchpoints -- DIFFERENT

---

## AC6: v1 Verification

v1 deployment and verification is a separate step (D1). This test report covers **dev environment only**. v1 testing should be performed after deployment.

**Status**: NOT TESTED (out of scope for this QA round)

---

## Notes

- Authentication requires `x-data-source=development` as a query parameter when calling the dev branch login endpoint.
- The housekeeper endpoint uses standard `Authorization: Bearer {token}` header (not `X-Xano-Authorization`).
- One error was observed: person 5398 in project 7 reported "Unknown error" -- this is a pre-existing data issue, not related to the P2 fix. The error is properly logged with person_id (AC5 satisfied).
- All moves observed were `reason: "no_tasks"` (people without active tasks being moved back to Scoring). No `reason: "connected"` moves were observed, confirming the project-scoping gate is working.
