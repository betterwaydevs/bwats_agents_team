# N1: Orchestrator WhatsApp Notifications

**Priority**: Medium
**Type**: BOTH
**Projects**: bwats_xano (backend), team (orchestrator)
**Status**: pending
**Created**: 2026-03-06

---

## Problem

When the multi-agent team finishes a task or needs user attention (approval, feedback, clarification), there's no real-time notification to Pablo's phone. Currently he must:
- Check the dashboard manually to see if tasks are done
- Monitor delivery logs to see if User: Approval is pending
- Wait for agents to finish without knowing when they're done

This creates delays in the feedback loop and prevents timely approvals or responses.

---

## Solution

Use the existing **WHAPI WhatsApp integration** already in Xano to send Pablo a WhatsApp message when:
1. **Task completion**: A task pipeline completes and User: Approval is pending
2. **Attention needed**: An agent needs clarification, approval, or feedback
3. **Pipeline blocked**: A task is stuck waiting for user input

The WhatsApp message includes a **deep link to the task page** on the dashboard so Pablo can tap the link, read the question/context, and reply via the existing dashboard chat.

---

## Architecture

```
Orchestrator event (task done / agent needs input)
  → calls Xano POST /notifications/notify_pablo
    → function.run "communications/whatsapp_api_wrapper" (action: send_message)
      → WHAPI sends WhatsApp to Pablo's phone
        → Pablo taps link → Dashboard task page opens
          → Pablo replies via dashboard chat
            → Reply routes back to waiting agent
```

### Why WHAPI instead of FCM/Firebase

- Already integrated in Xano (`communications/whatsapp_api_wrapper`, ID 1573)
- No SDK, no device registration, no PWA changes needed
- WhatsApp messages are reliable and work on any phone
- Pablo already uses WhatsApp

---

## V1 Scope (MVP)

### Phase 1: Xano Notification Endpoint

- [ ] **Create endpoint**: `POST /notifications/notify_pablo`
  - Auth: system/admin (called by orchestrator scripts)
  - Input:
    - `title` (text) — short subject, e.g. "Task QF13 Complete"
    - `body` (text) — detail message, e.g. "The parsing status page is ready for your review"
    - `task_id` (text, optional) — task ID for deep link
    - `url` (text, optional) — full URL override (if no task_id)
  - Logic:
    1. Build message string: `{title}\n\n{body}\n\n{link}`
    2. Link: if `task_id` → `http://100.114.78.113:3000/tasks/{task_id}` (or production URL)
    3. Call `function.run "communications/whatsapp_api_wrapper"` with `action: "send_message"`, `chat_id: env.PABLO_WHATSAPP_CHAT_ID`, `message: ...`
  - Output: `{ success: true, message_id: "..." }`

- [ ] **Add env var**: `PABLO_WHATSAPP_CHAT_ID` — Pablo's WhatsApp chat ID (e.g. `5215512345678@c.us`)
- [ ] **Add env var**: `DASHBOARD_BASE_URL` — `http://100.114.78.113:3000` (configurable)

- [ ] **Test endpoint**: Call it manually, verify WhatsApp message arrives with correct link

### Phase 2: Orchestrator Integration

Trigger `notify_pablo` at these orchestrator events:

- [ ] **Team close (task done)**: When orchestrator closes a team after PO approval, call notify_pablo
  - Title: `"Task {ID} Ready for Review"`
  - Body: `"{task_title} has been completed and is waiting for your approval."`
  - task_id: `{ID}`

- [ ] **Agent needs input (AskUserQuestion)**: When an agent calls `AskUserQuestion`, send notification
  - Title: `"Agent Needs Input — {ID}"`
  - Body: brief summary of the question
  - task_id: `{ID}`
  - Note: Question is visible on the task page via the delivery log

- [ ] **Approval blocked**: When orchestrator detects a User: Approval `blocked` stage that now needs re-engagement
  - Title: `"Pipeline Resumed — {ID}"`
  - Body: `"Task {ID} has been updated based on your feedback and needs re-approval."`

### Phase 3: Task Page Pending Question Display (Dashboard)

- [ ] **Task page shows pending question**: When a task delivery log has a pending agent question, the task detail page in the dashboard highlights it
  - The pending question is shown at the top of the page (not buried in the log)
  - Existing dashboard chat input allows Pablo to type and send a reply
  - Reply routes back to the waiting agent

---

## Acceptance Criteria

### AC1: Notification Sent on Task Completion
**Given** the orchestrator closes a team after PO approval
**When** User: Approval status is `pending`
**Then** a WhatsApp message is sent to Pablo's phone
**And** the message includes the task ID and title
**And** the message includes a clickable link to the task detail page

### AC2: Notification Sent on Agent Question
**Given** an agent calls AskUserQuestion during a pipeline
**When** the question is presented to the user
**Then** a WhatsApp message is sent with the question summary
**And** the message links to the task page (not a generic /chat URL)

### AC3: Deep Link Works
**Given** Pablo receives a WhatsApp notification
**When** he taps the link
**Then** the dashboard opens to the correct task detail page
**And** the task context (delivery log, question) is visible

### AC4: Notification Delivery Within 30 Seconds
**Given** a trigger event (task done, question asked)
**When** notify_pablo is called
**Then** the WhatsApp message arrives within 30 seconds

### AC5: Endpoint Handles Missing task_id
**Given** notify_pablo is called without a task_id
**When** a url override is provided instead
**Then** the message uses that URL
**And** if neither task_id nor url provided, the link is omitted gracefully

### AC9: Task Page Shows Pending Question
**Given** Pablo taps a notification linked to a task
**When** the task detail page loads
**Then** any pending question or approval request is shown at the top of the page
**And** the question is clearly formatted (not buried in the delivery log)
**And** the existing dashboard chat input is available to type a response
**And** submitting the chat response resolves the pending agent question

---

## Technical Notes

### WHAPI Wrapper (existing, ID 1573)

```
Function: communications/whatsapp_api_wrapper
GUID: TH2Rn83bWB7PHqMoGtg9DHbB1E4
Actions: send_message, get_message, get_messages, get_chat, get_all_chats, health
```

The `send_message` action needs:
- `chat_id` — recipient's WhatsApp chat ID (e.g. `5215512345678@c.us`)
- `message` — text content

### Message Format

```
Task QF13 Ready for Review

The parsing status page is ready for your approval.

View on dashboard: http://100.114.78.113:3000/tasks/QF13
```

### Orchestrator Integration Point

The orchestrator already calls `Bash` to run git commands and update files. It can use `curl` or `WebFetch` to call the Xano notification endpoint:

```bash
curl -s -X POST \
  "https://xano.atlanticsoft.co/api:CANONICAL/notifications/notify_pablo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $XANO_SYSTEM_TOKEN" \
  -d '{"title": "Task QF13 Ready for Review", "body": "...", "task_id": "QF13"}'
```

Or the backend-developer agent adds the notify call inside the Xano task completion workflow itself.

---

## Dependencies

- WHAPI already integrated in Xano (no new external accounts needed)
- Pablo's WhatsApp chat_id stored in Xano env var `PABLO_WHATSAPP_CHAT_ID`
- Dashboard base URL stored in Xano env var `DASHBOARD_BASE_URL`
- Dashboard task detail page must exist (already does for delivery log view)

---

## Security Considerations

- Endpoint requires auth (system token or admin user) — not publicly callable
- `PABLO_WHATSAPP_CHAT_ID` stored as Xano environment variable (not in code)
- Notification content: task IDs and titles only — no sensitive candidate data

---

## Future Enhancements (V2+)

- **Reply routing**: WhatsApp reply from Pablo routes back to waiting agent automatically (via WHAPI webhook → Xano → orchestrator)
- **Quiet hours**: Don't send notifications between 10 PM – 7 AM
- **Multiple recipients**: Notify other team members
- **Notification history**: Store sent notifications in DB for audit trail
- **Rich formatting**: Use WhatsApp formatting (bold, lists) for better readability

---

## Testing Plan

### Test 1: Manual Endpoint Call
- Call `POST /notifications/notify_pablo` with test title/body/task_id
- Verify WhatsApp arrives on Pablo's phone within 30 seconds
- Verify message format and deep link are correct

### Test 2: Task Completion Flow
- Run a task through the full pipeline to PO approval
- Verify notify_pablo is triggered when orchestrator closes the team
- Tap the link, verify dashboard opens to correct task page

### Test 3: Agent Question Flow
- Trigger AskUserQuestion from an agent mid-pipeline
- Verify notification sent with question summary
- Tap link, verify task page shows the pending question

### Test 4: No task_id Fallback
- Call notify_pablo without task_id but with url override
- Verify correct URL appears in message
- Call without either — verify graceful handling (no broken link)
