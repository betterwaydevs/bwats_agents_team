# QF14 — Add_prospect db.patch Type Error (Conflict Status)

> **Type**: BACK | **Priority**: Medium | **Status**: pending

## Problem

The `Add_prospect` endpoint returns a `conflict` status with this error for some prospects:

```json
{
  "found": true,
  "id": 72100,
  "status": "conflict",
  "es_doc_id": null,
  "es_existed": false,
  "error": "xano\\helper\\DBO::set(): Argument #2 ($b) must be of type array, string given, called in /xano/bin/includes/xano/xs/statement/mvp/Patch.php on line 99"
}
```

## Root Cause (Investigation Needed)

A `db.patch` (or `db.edit`) call in the `Add_prospect` endpoint is passing a **string** where Xano expects an **array**. This likely happens in the data update after parsing — one of the JSON fields (`skills`, `work_history`, `education`, `certifications`, `languages`, `industries`) is being stored as a JSON string instead of a parsed array/object.

## Investigation Steps

1. Find the `db.patch` / `db.edit` call in `Add_prospect` (`42291_Add_prospect_GET.xs`) that triggers this
2. Check prospect ID 72100 — what does its raw data look like? Which field has a string instead of array?
3. Determine if the AI parser is returning stringified JSON instead of parsed objects
4. Fix the endpoint to handle both string and array inputs (parse if string)

## Acceptance Criteria

- [ ] AC1: Identify which field causes the type mismatch
- [ ] AC2: Fix the `Add_prospect` endpoint to handle string-encoded JSON fields
- [ ] AC3: Reprocess prospect 72100 successfully
- [ ] AC4: No more `conflict` status from type errors

## References

- Endpoint: `Add_prospect` GET — `../bwats_xano/apis/prospects/42291_Add_prospect_GET.xs`
- Xano prospects API group: `zE_czJ22`
