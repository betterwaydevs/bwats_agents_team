# M3: Auto-Reply Email for Job Applications

**Priority**: Medium
**Type**: BACK
**Projects**: bwats_xano

## Problem
No confirmation email is sent when someone applies to a job via Quick Apply. Applicants don't know their application was received.

## Requirements

### 1. Default Email Account
- Use `jobs@email.betterway.dev` as the general application reply account
- Account type: `application_thank_you` (already exists in email_account enum)
- This account is used exclusively for auto-reply thank-you emails

### 2. Auto-Reply on Application
- After a successful `quick_apply`, automatically send a confirmation email to the applicant
- Only send if the applicant provided an email address
- Use `enqueue_email` with `account_type: application_thank_you`
- Include project name in the email so they know which job it's for

### 3. Email Template (hardcoded for now)
Simple, professional confirmation:
- Subject: "Thanks for applying — {project_title}"
- Body: Acknowledge their application, tell them a recruiting team will be in touch
- From: `jobs@email.betterway.dev` (display name: "BetterWay Jobs")

## Implementation

### Step 1: Create email account in Xano
Add record to `email_account` table:
- `email_address`: `jobs@email.betterway.dev`
- `display_name`: `BetterWay Jobs`
- `from_header`: `BetterWay Jobs <jobs@email.betterway.dev>`
- `account_type`: `application_thank_you`
- `active`: true
- `daily_limit`: 200 (higher than normal — auto-replies can spike)

### Step 2: Update `enqueue_email` function
Add `application_thank_you` to the `account_type` enum values (currently only has `outbound_general`, `general`, `individual`).

### Step 3: Add auto-reply to `quick_apply`
After the stage history is created (end of Section F, ~line 596), add:
- Check if `$input.email` is not null/empty
- Fetch project title from `$project`
- Build simple HTML email body
- Call `enqueue_email` with account_type `application_thank_you`
- Wrap in try_catch so a failed enqueue doesn't break the application

## Acceptance Criteria
- [ ] AC1: `jobs@email.betterway.dev` account exists in email_account with type `application_thank_you`
- [ ] AC2: `enqueue_email` accepts `application_thank_you` as account_type
- [ ] AC3: Submitting a quick_apply with an email triggers an auto-reply email
- [ ] AC4: Auto-reply uses the `application_thank_you` account (not round-robin general)
- [ ] AC5: Email contains the project/job title
- [ ] AC6: If applicant has no email, no auto-reply is sent (no error)

## Dependencies
- **M1** (Email Account Stickiness) — done
- **M2** (Email Event Tracking) — done (delivery tracking will capture these auto-replies too)
