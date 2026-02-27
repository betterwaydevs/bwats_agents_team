# P3: Add Prospect — Manual E2E Test

**Priority**: High
**Type**: TEST

## Problem
Add Prospect GET endpoint deployed to dev + v1 but never manually tested with real data.

## Tasks
- [ ] Test on dev with real prospect
- [ ] Test on v1 with real prospect data
- [ ] Update n8n/extension to call `POST /api:zE_czJ22/Add_prospect` with `{"auth_token": "<N8N_WEBHOOK_TOKEN>"}`
- [ ] Confirm n8n webhook URL and trigger schedule

## Acceptance Criteria
- Endpoint returns correct response on both dev and v1
- n8n integration calls the correct endpoint with proper auth
- Webhook trigger fires on schedule
