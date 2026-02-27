# M9: Incoming WhatsApp Messages & Notifications

**Priority**: Medium
**Type**: BOTH
**Projects**: bwats_xano, nearshore-talent-compass

## Problem
Currently WhatsApp is send-only. When someone replies via WhatsApp, there's no notification in BWATS — users have to manually check each person's profile to see if they got a response.

## What Exists Already
- **WHAPI wrapper** (`functions/communications/2382_whatsapp_api_wrapper.xs`) — supports `get_messages`, `get_chat`, `send_message`
- **WhatsApp chat UI** (`WhatsAppTab.tsx`) — full chat interface on person profile with message display, send, status indicators
- **Messaging API group** (canonical: `2CPT0xvS`) — `get_whatsapp_messages`, `send_custom_whatsapp_message`, `send_whatsapp_messages`
- **Touchpoint recording** — outbound messages already create touchpoints with `channel: "whatsapp"`

## V1 Scope

### Backend
- [ ] **Webhook endpoint** — Receive WHAPI incoming message webhooks (`POST /messaging/whatsapp_webhook`)
  - Validate webhook signature/auth
  - Parse incoming message payload (sender phone, message text, timestamp, message ID)
  - Match sender phone number to existing prospect/candidate in DB
  - Store message and mark as **unread**
- [ ] **Unread notifications endpoint** — `GET /messaging/whatsapp_unread`
  - Return list of unread incoming WhatsApp messages grouped by person
  - Include: person_id, person_type, person_name, phone_number, last_message_preview, unread_count, timestamp
- [ ] **Mark as read endpoint** — `PUT /messaging/whatsapp_mark_read`
  - Input: person_id, person_type
  - Mark all unread WhatsApp messages from that person as read
- [ ] **Touchpoint for inbound** — Create touchpoint with `channel: "whatsapp"`, `direction: "inbound"` when message received

### Frontend
- [ ] **Notification icon in header** — WhatsApp icon (or bell) with unread badge count
  - Poll `whatsapp_unread` endpoint periodically (every 30-60s)
  - Show total unread count as badge number
- [ ] **Notification dropdown/list** — Click icon to see list of people who sent messages
  - Show person name, last message preview, timestamp, unread count per person
- [ ] **Navigate to profile** — Click a notification item → navigate to the person's profile page where the existing WhatsApp chat tab shows the conversation
- [ ] **Auto-mark read** — When user views the WhatsApp tab on a person's profile, call `whatsapp_mark_read` to clear the unread state

### WHAPI Configuration
- [ ] Configure WHAPI webhook URL to point to the new Xano endpoint
- [ ] Verify webhook events are firing for incoming messages

## Acceptance Criteria
- When someone sends a WhatsApp message, a notification appears in the BWATS header within 60 seconds
- Notification shows unread count badge
- Clicking notification takes user to the person's profile
- The existing WhatsApp chat tab shows the incoming message
- Viewing the chat clears the unread notification for that person
- Inbound messages are recorded as touchpoints
- Unknown phone numbers (no matching person) are handled gracefully (logged but no notification)

## Dependencies
- WHAPI account with webhook support enabled
- WHAPI webhook URL must be publicly accessible from WHAPI servers

## References
- WHAPI docs for webhook configuration
- Existing wrapper: `functions/communications/2382_whatsapp_api_wrapper.xs`
- Chat UI: `src/components/profile/tabs/WhatsAppTab.tsx`
- Header: `src/components/UserHeader.tsx`
