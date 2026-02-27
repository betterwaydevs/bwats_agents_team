# M9: Incoming WhatsApp Messages & Notifications — Progress Log

## Manual Tasks for Pablo

### Xano Setup (DONE)
1. ~~**Refresh Xano MCP token**~~ DONE — Token refreshed and working.
2. ~~**Create `whatsapp_unread` table**~~ DONE — Table ID 201, development branch.
3. **Check touchpoint `direction` enum** — May only have "outbound". Needs "inbound" added for webhook touchpoints.
4. ~~**Deploy the 3 XanoScript endpoints**~~ DONE — All 3 deployed to messaging API group (development branch):
   - `POST /messaging/whatsapp_webhook` (ID: 43110, auth: none)
   - `GET /messaging/whatsapp_unread` (ID: 43111, auth: user)
   - `PUT /messaging/whatsapp_mark_read` (ID: 43112, auth: user)

### WHAPI Configuration
5. **Configure WHAPI webhook** — In WHAPI dashboard, set the incoming message webhook URL to:
   `https://xano.atlanticsoft.co/api:2CPT0xvS:{env}/messaging/whatsapp_webhook`
   (replace `{env}` with `dev` or `v1` depending on environment)
6. **Verify WHAPI webhook events** — Enable "incoming message" event type in WHAPI webhook settings

### Testing
7. **Test with a real WhatsApp message** — Send a message from a personal phone to the WHAPI number and verify notification appears in header

### Carried Over from Other Tasks
8. **Test Tailscale/IP situation** (L1 VM task)
9. **Run VM Playwright tests** — `cd nearshore-talent-compass && npx playwright test tests/virtual-machines.spec.ts --project=chromium`
10. **Review VM PDF report** — at `nearshore-talent-compass/tests/report/vm_test_report.pdf`

---

## 2026-02-27 — Session 1: Building V1

### Status: Code Complete — Pending Xano Deployment

### What was built

**Frontend (nearshore-talent-compass) — 3 files:**

1. `src/services/whatsappNotificationApi.ts` — API service
   - `getWhatsAppUnread(token)` → `GET /messaging/whatsapp_unread`
   - `markWhatsAppRead(token, personId, personType)` → `PUT /messaging/whatsapp_mark_read`
   - Uses existing `API_KEYS.emailMessaging` (`2CPT0xvS`) — no new API keys

2. `src/components/WhatsAppNotificationDropdown.tsx` — Notification dropdown
   - `MessageCircle` icon with green badge (`bg-green-500`)
   - Popover dropdown with ScrollArea showing person name, last message preview, relative timestamp
   - Click navigates to `/profile/{person_slug}?tab=communication`
   - Polls every 60s via `useQuery` with `refetchInterval: 60_000`
   - Shows `9+` when unread count exceeds 9

3. `src/components/UserHeader.tsx` — Modified
   - Added WhatsAppNotificationDropdown between email badge and nav items (desktop)
   - Added WhatsAppNotificationDropdown in mobile header
   - Both gated behind `!isProjectRestricted`

TypeScript compiles clean (`npx tsc --noEmit` passes).

**Backend (bwats_xano) — 3 XanoScript files:**

1. `apis/messaging/whatsapp_webhook_POST.xs` — Incoming webhook receiver
   - Auth: none (WHAPI server calls this)
   - Parses WHAPI payload, strips `@s.whatsapp.net`, cleans phone digits
   - Searches `parsed_candidate` then `parsed_prospect` by phone
   - Upserts `whatsapp_unread` record (increment count or create new)
   - Creates inbound touchpoint via `touchpoint_create` function
   - Always returns 200 (prevents WHAPI retries)

2. `apis/messaging/whatsapp_unread_GET.xs` — List unread notifications
   - Auth: user JWT
   - Queries `whatsapp_unread` where `unread_count > 0`, sorted newest first
   - Enriches with person name/slug from candidate/prospect tables
   - Returns `{ items: [...], total_unread: N }`

3. `apis/messaging/whatsapp_mark_read_PUT.xs` — Mark as read
   - Auth: user JWT
   - Input: `person_id`, `person_type`
   - Sets `unread_count = 0`, `read_at = now`

### Blockers
- ~~**Xano MCP token expired** — Cannot create table or deploy endpoints until token is refreshed~~ RESOLVED

---

## 2026-02-27 — Session 2: Xano Deployment

### Status: Backend Deployed to Development Branch

### What was deployed

**Table created:**
- `whatsapp_unread` (ID: 201) on development branch
  - Fields: id, person_id, person_type, phone_number, last_message, last_message_at, unread_count (default 0), message_id, created_at (default now), read_at
  - Indexes: primary(id), btree(person_id+person_type), btree(unread_count DESC), btree(last_message_at DESC)

**Endpoints deployed to messaging API group (canonical: 2CPT0xvS, group ID: 1516):**

1. `POST /messaging/whatsapp_webhook` (ID: 43110) — Auth: none
   - Fixed: Removed `return` statement inside conditional (not valid in XanoScript API stacks)
   - Fixed: Wrapped foreach in conditional instead of early return
   - Fixed: Used lambda extraction for `as` variable dot-access (XanoScript gotcha)

2. `GET /messaging/whatsapp_unread` (ID: 43111) — Auth: user JWT
   - Fixed: Sort syntax from `[{field: "name", dir: "dir"}]` to `{table.field: "dir"}`
   - Fixed: Used lambda extraction for all `as` variable field access
   - Returns enriched items with person_name, person_slug, and total_unread count

3. `PUT /messaging/whatsapp_mark_read` (ID: 43112) — Auth: user JWT
   - Fixed: Used lambda extraction for unread_record.id access

### XanoScript Fixes Applied During Deployment
- `return = $var` is NOT valid inside API stack conditionals — restructured to wrap logic in conditional
- Sort syntax is `{table.field: "dir"}` not `[{field: "name", dir: "dir"}]`
- Lambda `as` variable dot-access is unreliable — use follow-up lambdas to extract fields
- MCP Streamable HTTP transport used (SSE transport has auth issues per LEARNINGS.md)

### Remaining Manual Tasks
- Configure WHAPI webhook URL to point to the new endpoint
- Set `WHAPI_WEBHOOK_SECRET` environment variable in Xano
- Test with a real WhatsApp message
- Verify touchpoint `direction` enum includes "inbound"
