# D1: Deploy M1, M2, M3, L6 & Pending Changes to Production

## Summary

Deploy all completed and pending work from M1, M2, L6, and fixes to production (Xano v1 branch + frontend push to origin/main).

---

## Xano: Dev → v1 Deployment

All items below exist on the `development` branch and need to be replicated/merged to `v1` (production).

### M1 — Email Account Stickiness

| Item | Type | Dev ID | Action |
|------|------|--------|--------|
| `process_email` | Function | 10568 | Update on v1 — add sticky account selection before round-robin + remove account_type gate (cross-type stickiness) |

> **Note**: `process_email` includes both M1 (sticky logic) and the M3 follow-up fix (removed `account_type` matching gate so sticky applies across all email types). Commit `6c801ea`.

### M2 — Email Event Tracking

| Item | Type | Dev ID | Action |
|------|------|--------|--------|
| `email_event` | Table | 202 | Create on v1 (resend_message_id, event_type, recipient, bounce fields, raw_payload) |
| `email_send_log` | Table schema | — | Add columns on v1: delivery_status, delivered_at, opened_at, clicked_at, open_count, click_count |
| `process_email_event` | Function | 10829 | Create on v1 — parses webhook events, updates email_send_log progressively |
| `webhook_resend_inbound` | API endpoint | — | Update on v1 — add routing for email.delivered/opened/clicked/bounced/complained |
| `email_stats` | API endpoint | 43129 (dev) | Create on v1 — per-account/project stats with rates |
| `email_send_log` | API endpoint | 43134 (dev) | Create on v1 — paginated email listing with filters |
| `email_stats_timeseries` | API endpoint | 43135 (dev) | Create on v1 — weekly/daily stats breakdown |

### M2 — Resend Webhook Configuration

| Item | Action |
|------|--------|
| Resend webhook URL | Configure in Resend dashboard to point to production `webhook_resend_inbound` endpoint on v1 |
| `RESEND_WEBHOOK_TOKEN` | Verify token `73c409b` is set in Xano v1 env vars |

### M3 — Auto-Reply Email for Job Applications

| Item | Type | Dev ID | Action |
|------|------|--------|--------|
| `enqueue_email` | Function | 10567 | Update on v1 — add `application_thank_you` to account_type enum |
| `candidate/quick_apply` | API endpoint | 16878 | Update on v1 — add Section G auto-reply after application |
| `jobs@email.betterway.dev` | Email account | 32 (dev) | Create on v1 in email_account table |

### M3 — Live Database Fix

| Item | Action |
|------|--------|
| `email_account` ID 32 on v1 | PATCH: `email_address: jobs@email.betterway.dev`, `from_header: "BetterWay Jobs <jobs@email.betterway.dev>"`, `active: true` |

---

## Frontend: Commit & Push to origin/main

### Unpushed commits (on main, not yet on origin/main)

| Commit | Description | Related Task |
|--------|-------------|--------------|
| `2bbe16a` | Add Email Stats page with filtering and breakdown views | M2 |
| `ac6b9eb` | Fix email stats breakdown: field name mapping and account filter | M2 |
| `b058e13` | Add email log table, time-series chart, and tabbed layout | M2 |
| `d75ae06` | Add CLI token page, fix chart scaling, fix mobile header overflow | L6, M2 fix, header fix |

### Deploy steps

1. Push all commits to `origin/main` (`git push`)
2. Lovable auto-deploys from main (verify deployment succeeds)

---

## Post-Deploy Verification

| Check | How |
|-------|-----|
| M1 sticky reuse | Send 2 emails to same recipient on v1, verify same account used |
| M1/M3 cross-type sticky | Apply via quick_apply, then send outbound — verify both use `jobs@email.betterway.dev` |
| M2 webhook capture | Send test email, verify `email_event` records created on v1 |
| M2 stats page | Load `/email-stats` on production, verify cards + chart + table render |
| M2 chart scale | Verify Y-axis shows 0-100% (not 260%) |
| L6 CLI token page | Load `/cli-token` on production, verify login redirect + token display |
| Mobile header | Verify no horizontal scroll on mobile |
| Resend webhook | Confirm webhook URL is configured and events flow to v1 |

---

## Acceptance Criteria

- [ ] AC1: All M1 Xano changes live on v1 branch
- [ ] AC2: All M2 Xano tables, functions, and endpoints live on v1 branch
- [ ] AC3: Frontend committed and pushed to origin/main, auto-deploy succeeds
- [ ] AC4: Email Stats page loads on production with correct chart scaling
- [ ] AC5: Resend webhook configured for production and events flowing
- [ ] AC6: CLI token page works on production (/cli-token)
- [ ] AC7: Mobile header no longer scrolls horizontally
- [ ] AC8: M3 Xano changes (enqueue_email, quick_apply, email account) live on v1
- [ ] AC9: `jobs@email.betterway.dev` verified as sender in Resend
- [ ] AC10: Cross-type sticky works — application auto-reply account sticks for subsequent outbound emails
