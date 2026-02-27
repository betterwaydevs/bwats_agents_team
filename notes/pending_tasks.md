# BWATS — All Pending Tasks

> Single source of truth. Updated: 2026-02-26

---

## 🔴 High Priority

### P1. Prospects Grid Freezing After Actions [FRONT]
Frontend grid freezes after any action (stage move, task complete) and data refresh. Users can't click checkboxes. Backend touchpoints already optimized (limited to 5 per person, 94% payload reduction) — freeze persists.
- [ ] Profile with Chrome DevTools — identify long tasks during refresh
- [ ] Check if grid re-renders all rows vs surgical update
- [ ] Check for race conditions (multiple API calls after action)
- [ ] Check checkbox state loss during re-render

### P2. Auto-Organize Housekeeper — Failing to Move People [BACK]
Pipeline housekeeper (`auto_organize`) fails to move some people to correct stages.
- [ ] Investigate which people fail and why (dev task 398, v1 task 414)
- [ ] Check endpoint 39456 (dev) / 39708 (v1) logs
- [ ] Fix movement logic
- [ ] Verify stage transitions after fix

### P3. Add Prospect — Manual E2E Test [TEST]
Add Prospect GET endpoint deployed to dev + v1 but never manually tested with real data.
- [ ] Test on dev with real prospect
- [ ] Test on v1 with real prospect data
- [ ] Update n8n/extension to call `POST /api:zE_czJ22/Add_prospect` with `{"auth_token": "<N8N_WEBHOOK_TOKEN>"}`
- [ ] Confirm n8n webhook URL and trigger schedule

---

## 🟡 Medium Priority — Backend

### M1. Email Account Stickiness Per Person [BACK]
Once we email someone from a specific account, reuse that account for consistency.
- [ ] In `process_email`, check email_send_log for most recent "sent" to same `to_email`
- [ ] If found + active + under limit → use it (bypass round-robin)
- [ ] Fallback to round-robin if sticky account unavailable
- **File**: `functions/communications/10568_process_email.xs`

### M2. Email Event Tracking (Opens, Clicks, Bounces) [BOTH]
Track full email delivery lifecycle from Resend webhooks.
- [ ] Capture webhook events: email.delivered, email.opened, email.clicked, email.bounced
- [ ] Create `email_event` table
- [ ] Update email_send_log with delivery status
- [ ] Statistics API per account/project
- [ ] Frontend: event timeline, stats page, person profile signals

### M3. Auto-Reply Email for Job Applications [BOTH]
Auto-send confirmation email when someone applies to a job.
- [ ] Create `application_auto_reply` email account
- [ ] Trigger auto-reply via `enqueue_email` in application flow
- [ ] Configurable template per project
- **Depends on**: M1 (account stickiness)

### M4. Filter People by Last Outreach Date [BOTH]
Search/filter people in a stage by when they were last contacted.
- [ ] Add `last_outreach_date` filter to association/people endpoint
- [ ] Query touchpoints for most recent per person
- [ ] Frontend: date range filter in people-in-stage view

### M5. Frontend: Permission UI Changes [FRONT]
User project permissions middleware is deployed but frontend needs updates.
- [ ] Send auth token on project list + detail calls
- [ ] Decode JWT to check `user_role_id` for UI-level logic
- [ ] Hide unauthorized projects in UI
- **Ref**: `notes/frontend_permission_changes.md`

### M6. Frontend: LinkedIn "My Connections" Filter [FRONT]
Filter tasks/people by LinkedIn connections of the current user.
- [ ] Add "My Connections" toggle in tasks filter area
- [ ] Get user ID from `GET /auth/me` or JWT
- [ ] Append `connected_to_user_id` param when filter active
- **Ref**: `notes/frontend_linkedin_connection_filter.md`

### M7. Replace Hardcoded "Laura Pulgarin" in Templates [BACK]
10 project templates have hardcoded recruiter name instead of dynamic variable.
- [ ] Search projects for `Laura Pulgaring` (7), `Laura Pulgarin` (2), `Laura Pulgarín` (1)
- [ ] Replace with dynamic variable or correct current recruiter name
- **Ref**: `TEMPLATE_EXTRACTION_SUMMARY.md`

### M8. Task Supervisor Agent [BACK] — NEW
New agent to supervise and manage task execution across the pipeline.
- [ ] Define agent scope and responsibilities
- [ ] Identify which tools it needs
- [ ] Create agent definition
- **Tools dir**: `tools/` (27 existing tools)
- **Agents dir**: `agents/` (7 existing agents)

---

## 🟢 Low Priority — Future Features

### L1. Virtual Machines / RDP Section [FRONT]
New section to connect to remote VMs. Start with RDP links, optionally Guacamole.
- [ ] Create `virtual_machine` table + CRUD API
- [ ] Frontend: VM list with status, "Connect" button

### L2. Prerender / SEO Meta Tags [FRONT/INFRA]
Proper Open Graph tags for public pages shared on social media.
- [ ] Choose approach: prerender.io / Lambda@Edge / static generation
- [ ] API for meta tag data per page
- [ ] Configure crawler detection

### L3. LinkedIn Matching Optimization [BACK]
Normalize LinkedIn URLs for better person matching.
- [ ] Create `associations/normalize_linkedin_for_matching` helper
- [ ] Update `automatic_action_association` for exact match
- [ ] Normalize `Connection_Profile_URL` on save
- **Ref**: `requirements/linkedin_matching_optimization.md`

### L4. CoreSignal Enrichment — Manual Fix [BACK]
CoreSignal API integration has MCP deployment bug.
- [ ] Fix Function 2504 in Xano UI (verify URL, method, headers)
- [ ] Fix API 17010 (verify function call path)
- [ ] Test with curl
- **Ref**: `requirements/coresignal.md`

---

## 🔧 Quick Fixes (< 15 min each)

| Item | Effort | Status |
|------|--------|--------|
| Verify `UNSUBSCRIBE_SECRET` is set in Xano env | 5 min | Pending |
| Fix email inbox hurl test (expects HTML, gets JSON for unsubscribe) | 10 min | Pending |
| Bulk cleanup 43 zombie "executing" tasks on dev from Jan 20 | 5 min | Pending |
| Extend retry 24h cutoff so old failed tasks get retried | 10 min | Pending |

---

## 👤 Delegated to Intern

| # | Item | Status |
|---|------|--------|
| 16 | Global Super Admin Settings (multi-tenant) | Not started |
| 17 | Expanded Template System | Not started |
| 19 | Duplicate Candidate Detection & Merge | Not started |

---

## ✅ Completed

| # | Item | Completed |
|---|------|-----------|
| 9 | AI Reply Suggestion Agent (LinkedIn + Email) | Feb 2026 |
| 14 | Email Round Robin + Inbox + AI Draft | Feb 2026 |
| 20 | Add Application Tool to Recruiter Assistant | Feb 22 |
| — | Scoring Agent: pre-fetch person data fix | Feb 26 |
| — | People endpoint: touchpoints limit (5) + required pagination | Feb 26 |
| — | User permissions middleware (get_permissions) | Feb 2026 |
| — | Retry & hung task system (dev + v1) | Feb 2026 |
| — | LinkedIn Conversation Analyzer (dev + v1) | Feb 2026 |
| — | Association search (accent-insensitive, multi-word) | Feb 2026 |

---

## Legend
- `[BACK]` Backend (Xano APIs/Functions/Tasks)
- `[FRONT]` Frontend (Static HTML/JS/CSS)
- `[EXT]` Browser extension
- `[BOTH]` Backend + Frontend
- `[TEST]` Testing/validation
