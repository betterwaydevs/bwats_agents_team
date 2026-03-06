# INT2: Expanded Template System

**Status**: Pending
**Priority**: Medium
**Owner**: Backend + Frontend

---

## Overview

Replace the current per-project text template fields with a flexible **centralized template management system** that supports:
- **Global templates** (reusable across all projects)
- **Project-specific templates** (tied to one project)
- **Multiple template types** (email, WhatsApp, LinkedIn invite, LinkedIn InMail)
- **Structured content** (JSON with subject + content for channels that need it)
- **Template variables** for personalization (`{{first_name}}`, `{{project_title}}`, etc.)

---

## Current State (Problems)

The `project` table has these template fields as plain text:
- `messaging_template` (WhatsApp)
- `email_template`
- `linkedin_invite_template`
- `linkedin_inmail_template`
- `email_template_default`
- `linked_inmail_subject` (separate field for InMail subject)

**Issues**:
1. **No reusability** — every project duplicates common templates
2. **Inconsistent structure** — subject is separate from body for InMail, mixed for email
3. **No versioning** — can't track template changes over time
4. **Hard to manage** — no central UI to browse/edit all templates
5. **No soft-delete** — deleting a template breaks historical data

---

## Proposed Solution

### Phase 1: Core CRUD (First Workable Version)

Create a new `message_template` table and CRUD API group that allows:
1. **Create/edit/soft-delete templates** with a name, type, and JSON content
2. **List templates** filtered by type and/or project (hybrid: project-specific + global)
3. **Assign templates to projects** via dropdown selection (replaces direct text entry)
4. **Show available template variables** per type so users know what tags they can use

---

## Database Schema

### New Table: `message_template`

```xanoscript
table message_template {
  auth = false
  schema {
    int id {
      description = "Unique identifier for the template"
    }
    timestamp created_at?=now {
      description = "Creation date and time"
    }
    timestamp updated_at? {
      description = "Last modification date"
    }
    text name filters=trim {
      description = "Descriptive name of the template to identify it in lists"
    }
    text description? {
      description = "Optional longer description explaining when to use this template"
    }
    enum type {
      values = ["email", "whatsapp", "linkedin_invite", "linkedin_inmail"]
      description = "Type of communication channel"
    }
    json templatecontent {
      description = "JSON structure containing the message. E.g., {subject: 'Title', content: 'Message'}. Supports {{variables}}"
    }
    int project_id? {
      table = "project"
      description = "FK to the owner project. Null means the template is Global"
    }
    int created_by {
      table = "user"
      description = "FK to the user who created this template (auto-populated from $auth.id)"
    }
    bool is_active?=1 {
      description = "Soft-delete flag: true=active, false=deactivated"
    }
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "type", op: "asc"}]}
    {type: "btree", field: [{name: "project_id", op: "asc"}]}
    {type: "btree", field: [{name: "is_active", op: "asc"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree", field: [
      {name: "type", op: "asc"},
      {name: "project_id", op: "asc"},
      {name: "is_active", op: "asc"}
    ]}
    {type: "gin", field: [{name: "templatecontent", op: "jsonb_path_op"}]}
  ]
}
```

### JSON Structure for `templatecontent`

**For Email and LinkedIn InMail** (channels requiring a subject):
```json
{
  "subject": "Opportunity: {{project_title}}",
  "content": "Hi {{first_name}}, I'm contacting you regarding..."
}
```

**For WhatsApp and LinkedIn Invite** (channels without subject):
```json
{
  "content": "Hi {{first_name}}, I saw your profile and thought..."
}
```

---

## API Endpoints

### 1. API Group
**File**: `apis/templates/api_group.xs`

```xanoscript
api_group templates {
  base = "/templates"
}
```

---

### 2. Create Template (POST /templates)
**File**: `apis/templates/189_templates_POST.xs`

**Auth**: user
**Inputs**:
- `name` (text, required) — descriptive name for the template
- `type` (enum, required) — one of: `email`, `whatsapp`, `linkedin_invite`, `linkedin_inmail`
- `templatecontent` (json, required) — structured content (see JSON structure above)
- `project_id` (int, optional) — if null, template is global

**Logic**:
1. **Validate uniqueness**: Check if a template with the same `name` and `project_id` (or both null for global) already exists with `is_active = true`. If yes, return 409 Conflict error.
2. Execute `db.add message_template`
3. Auto-populate `created_by` with `$auth.id`
4. Set `is_active = true` by default
5. Set `created_at = now`

**Response**: Created template object with ID

**Error Responses**:
- `409 Conflict` — Template with this name already exists in this scope (project or global)

---

### 3. List Templates (GET /templates)
**File**: `apis/templates/189_templates_GET.xs`

**Auth**: user
**Inputs** (filters):
- `type` (enum, optional) — filter by template type
- `project_id` (int, optional) — filter by project (also includes global templates)
- `is_active` (bool, optional, default `true`) — show active/inactive

**Logic** (Hybrid Query):
```xanoscript
// Return both project-specific templates AND global templates
WHERE is_active = $input.is_active
  AND (project_id == $input.project_id OR project_id == null)
  [AND type = $input.type if provided]
ORDER BY created_at DESC
```

**Response**: Array of template objects

---

### 4. Get Single Template (GET /templates/{template_id})
**File**: `apis/templates/189_templates_template_id_GET.xs`

**Auth**: user
**Inputs**:
- `template_id` (int, path parameter)

**Logic**:
1. Execute `db.get message_template` by ID
2. If not found, throw 404 error
3. Return full template object including `templatecontent` JSON

**Response**: Template object

---

### 5. Edit Template (PUT /templates/{template_id})
**File**: `apis/templates/189_templates_template_id_PUT.xs`

**Auth**: user
**Inputs**:
- `template_id` (int, path parameter, required)
- `name` (text, optional)
- `type` (enum, optional)
- `templatecontent` (json, optional)
- `project_id` (int, optional)
- `is_active` (bool, optional)

**Logic**:
1. **Validate uniqueness** (if `name` or `project_id` is being changed): Check if another active template with the new `name` and `project_id` combination already exists. If yes, return 409 Conflict error.
2. Execute `db.edit message_template`
3. Update only provided fields (partial update)
4. Set `updated_at = now` manually

**Response**: Updated template object

**Error Responses**:
- `409 Conflict` — Template with this name already exists in this scope (project or global)

---

### 6. Delete Template (DELETE /templates/{template_id})
**File**: `apis/templates/189_templates_template_id_DELETE.xs`

**Auth**: user
**Inputs**:
- `template_id` (int, path parameter)

**Logic** (Soft-delete):
1. Execute `db.edit message_template`
2. Set `is_active = false` (do NOT use `db.delete`)
3. This preserves historical data for projects that used this template

**Response**: Success message or deleted template object

---

## Template Variables (Available Tags)

Create a reference endpoint or documentation that shows available variables per channel type:

### Common Variables (all types)
- `{{first_name}}` — candidate/prospect first name
- `{{last_name}}` — candidate/prospect last name
- `{{full_name}}` — candidate/prospect full name
- `{{company_name}}` — their current company
- `{{job_title}}` — their current role

### Project-Specific Variables
- `{{project_title}}` — project name
- `{{project_location}}` — project location
- `{{recruiter_name}}` — recruiting user's name
- `{{recruiter_email}}` — recruiting user's email

### Email-Specific Variables
- `{{unsubscribe_link}}` — mandatory unsubscribe link for compliance

**Implementation Note**: These variables are replaced at **send time** by the messaging/email sending endpoints (not stored in the template table).

---

## Frontend Requirements (Dashboard)

### Templates Management Section

**Route**: `/settings/templates` or `/templates`

#### 1. Templates List View
- Table showing all templates with columns:
  - Name
  - Type (badge with color per type)
  - Scope (Global vs. Project Name)
  - Created By
  - Created At
  - Actions (Edit, Delete)
- Filters:
  - Type dropdown (All, Email, WhatsApp, LinkedIn Invite, LinkedIn InMail)
  - Scope dropdown (All, Global, Current Project)
  - Status toggle (Active / Inactive)
- "Create New Template" button

#### 2. Create/Edit Template Form
**Fields**:
- **Name** (text input) — "Intro Email for Engineers"
- **Type** (dropdown) — email, whatsapp, linkedin_invite, linkedin_inmail
- **Scope** (dropdown) — Global or select a specific project
- **Subject** (text input) — only shown for `email` and `linkedin_inmail` types
- **Content** (textarea with variable helper) — main message body
- **Available Variables** (helper panel) — shows clickable tags that insert into subject/content

**Variable Helper Panel**:
- Shows all available variables as clickable chips
- Clicking a variable inserts it at cursor position in subject/content field
- Example: Click `{{first_name}}` → inserts into textarea

**Save Logic**:
1. Validate type-specific requirements (subject required for email/InMail)
2. Construct JSON payload:
   - If email/InMail: `{"subject": "...", "content": "..."}`
   - If WhatsApp/invite: `{"content": "..."}`
3. POST to `/templates` (create) or PUT to `/templates/{id}` (edit)

#### 3. Project Settings Integration

**In Project Edit Form** (`/projects/{id}/edit`):
- Add template selection dropdowns for each channel:
  - **Email Template** (dropdown) — shows email templates (global + project-specific)
  - **WhatsApp Template** (dropdown) — shows whatsapp templates
  - **LinkedIn Invite Template** (dropdown) — shows linkedin_invite templates
  - **LinkedIn InMail Template** (dropdown) — shows linkedin_inmail templates
- Each dropdown calls `GET /templates?type={type}&project_id={project_id}`
- Shows both global and project-specific templates
- Displays template name in dropdown

**Save Logic**:
- Store selected `template_id` in new fields on `project` table:
  - `email_template_id` (int, FK to message_template)
  - `whatsapp_template_id` (int, FK to message_template)
  - `linkedin_invite_template_id` (int, FK to message_template)
  - `linkedin_inmail_template_id` (int, FK to message_template)

---

## Migration Plan

### Phase 1 (First Version)
1. ✅ Create `message_template` table
2. ✅ Build CRUD API endpoints (`/templates`)
3. ✅ Create frontend Templates Management section
4. ✅ Add template selection dropdowns to Project Settings
5. ⚠️ **Leave old fields intact** (`messaging_template`, `email_template`, etc.) — don't delete yet
6. ✅ Add new FK fields to `project` table for template IDs

### Phase 2 (Migration & Cleanup)
1. Write migration script to convert existing project templates to `message_template` records
2. Update all messaging/email sending endpoints to read from new template system
3. Test thoroughly on development
4. Deploy to v1
5. **Deprecate old fields** (keep them for 1 month, then drop)

---

## Acceptance Criteria

### Backend (API)
- [ ] `message_template` table exists on dev and v1 with all fields and indexes
- [ ] API group `/templates` exists with all 5 CRUD endpoints
- [ ] POST `/templates` creates template with auto-populated `created_by` and `created_at`
- [ ] GET `/templates` returns hybrid results (global + project-specific) when `project_id` filter is used
- [ ] GET `/templates` filters correctly by `type` and `is_active`
- [ ] GET `/templates/{id}` returns full template object including JSON content
- [ ] PUT `/templates/{id}` updates only provided fields and sets `updated_at`
- [ ] DELETE `/templates/{id}` soft-deletes (sets `is_active=false`, does NOT physically delete)
- [ ] All endpoints require user authentication

### Frontend (Dashboard)
- [ ] Templates list view displays all templates with filters (type, scope, status)
- [ ] Create template form validates type-specific requirements (subject for email/InMail)
- [ ] Edit template form pre-populates with existing data
- [ ] Variable helper panel shows all available tags and inserts them on click
- [ ] Template form correctly constructs JSON payload based on type
- [ ] Project edit form has template selection dropdowns for all 4 channel types
- [ ] Template dropdowns show both global and project-specific templates
- [ ] Selecting a template in project settings saves the `template_id` to project

### Integration
- [ ] Creating a new template from frontend successfully saves to backend
- [ ] Editing a template updates the record and shows updated data on list view
- [ ] Soft-deleting a template hides it from active list but doesn't break projects
- [ ] Project can select and save template for each channel type
- [ ] Old template fields on project table remain functional during migration period

---

## Out of Scope (Phase 1)

These are **NOT** part of the first workable version:
- ❌ Template versioning/history
- ❌ Template preview with sample data
- ❌ Migration of existing project templates to new system
- ❌ Updating messaging/email endpoints to use new template system
- ❌ Template categories or tags
- ❌ Template search by content
- ❌ Template usage analytics
- ❌ Rich text editor for templates
- ❌ Template testing/sending test messages

---

## Dependencies

- **Backend**: Xano MCP connection, `project` table schema
- **Frontend**: Dashboard with existing project management UI
- **Auth**: User authentication system

---

## Testing Plan

### Backend Tests
1. **Create template** — verify all fields saved correctly, JSON structure valid
2. **List templates** — verify filters work (type, project_id, is_active)
3. **Hybrid query** — verify global templates appear for all projects
4. **Get single template** — verify 404 for non-existent ID
5. **Edit template** — verify partial updates, `updated_at` changes
6. **Soft-delete** — verify `is_active=false`, record still exists in DB
7. **Auth check** — verify unauthenticated requests fail

### Frontend Tests
1. **Templates list** — verify data loads, filters work
2. **Create form** — verify subject field shows/hides based on type
3. **Variable helper** — verify clicking tag inserts it into textarea
4. **JSON construction** — verify correct payload for each type
5. **Project settings** — verify template dropdowns populate correctly
6. **Template selection** — verify selecting template saves ID to project

### Integration Tests
1. **End-to-end create** — create template in UI, verify in DB via API
2. **End-to-end edit** — edit template in UI, verify changes in DB
3. **End-to-end delete** — soft-delete template, verify still in DB but `is_active=false`
4. **Project template assignment** — select template in project settings, verify FK saved

---

## Technical Notes

### Database Normalization

**Normal Form Compliance**: This schema is in **3rd Normal Form (3NF)**:
1. ✅ **1NF** — All columns contain atomic values (no repeating groups)
2. ✅ **2NF** — No partial dependencies (all non-key attributes depend on the entire primary key)
3. ✅ **3NF** — No transitive dependencies (non-key attributes don't depend on other non-key attributes)

**Key Design Decisions**:
1. **`created_by` is NOT NULL** — Every template MUST have a creator for audit trail. Auto-populated from `$auth.id`.
2. **`project_id` IS NULL for global templates** — Nullable FK is intentional and correct for this use case.
3. **Composite index on `(type, project_id, is_active)`** — Optimizes the most common query pattern (listing templates with filters).
4. **Uniqueness constraint enforced in API layer** — Template names must be unique within their scope (project or global) among active templates. This prevents confusion when selecting templates in dropdowns.
5. **Soft delete via `is_active`** — Preserves referential integrity for projects that used a template in the past.

### Why JSON for `templatecontent`?
1. **Flexibility** — handles both subject+content (email/InMail) and content-only (WhatsApp/invite)
2. **Future-proof** — can add more fields (e.g., `attachments`, `cc`, `bcc` for email) without schema changes
3. **Structured** — prevents the current issue where subject is a separate field (`linked_inmail_subject`)

### Why Soft-Delete?
- Historical data integrity — projects that used a template in the past shouldn't break
- Audit trail — can see when templates were deactivated
- Recovery — can reactivate a template if deleted by mistake

### Why Hybrid Query for List?
- UX convenience — when selecting a template for a project, users see both global templates (reusable) and templates specific to that project
- No need for separate "global templates" and "my project templates" tabs

---

## Open Questions / Decisions Needed

1. **Should we migrate existing project templates automatically?**
   → Recommendation: No, not in Phase 1. Let users manually create new templates and assign them. Migration can be Phase 2.

2. **Should template variables be validated on save?**
   → Recommendation: No, just store as-is. Validation happens at send time when variables are replaced.

3. **Should we allow duplicate template names?**
   → Recommendation: Yes, but show project scope to differentiate ("Intro Email (Global)" vs "Intro Email (Project X)")

4. **What happens to old template fields on project table?**
   → Recommendation: Keep them for now as fallback. Phase 2 migration will deprecate them.

5. **Should users be able to see/edit templates created by other users?**
   → Recommendation: Yes, all templates are shared within the workspace. `created_by` is just for tracking, not access control.

---

## File Checklist (Backend)

### Tables
- [ ] `tables/message_template.xs` — new table definition

### APIs
- [ ] `apis/templates/api_group.xs` — API group definition
- [ ] `apis/templates/189_templates_POST.xs` — create template
- [ ] `apis/templates/189_templates_GET.xs` — list templates
- [ ] `apis/templates/189_templates_template_id_GET.xs` — get single template
- [ ] `apis/templates/189_templates_template_id_PUT.xs` — edit template
- [ ] `apis/templates/189_templates_template_id_DELETE.xs` — soft-delete template

### Project Table Updates (Phase 2)
- [ ] `tables/147_project.xs` — add FK fields for template IDs:
  - `int email_template_id?`
  - `int whatsapp_template_id?`
  - `int linkedin_invite_template_id?`
  - `int linkedin_inmail_template_id?`

---

## File Checklist (Frontend)

### Routes
- [ ] `src/app/(dashboard)/templates/page.tsx` — templates list view
- [ ] `src/app/(dashboard)/templates/new/page.tsx` — create template form
- [ ] `src/app/(dashboard)/templates/[id]/edit/page.tsx` — edit template form

### Components
- [ ] `src/components/templates/TemplatesList.tsx` — table with filters
- [ ] `src/components/templates/TemplateForm.tsx` — create/edit form with variable helper
- [ ] `src/components/templates/VariableHelper.tsx` — clickable variable tags panel
- [ ] `src/components/templates/TemplateTypeSelect.tsx` — dropdown for template type
- [ ] `src/components/projects/ProjectTemplateSelect.tsx` — template selection dropdowns for project settings

### API Integration
- [ ] `src/lib/api/templates.ts` — API client functions:
  - `createTemplate(data)`
  - `listTemplates(filters)`
  - `getTemplate(id)`
  - `updateTemplate(id, data)`
  - `deleteTemplate(id)`

---

## Success Metrics

- [ ] Users can create and manage templates from a central location
- [ ] Projects can select templates from dropdowns instead of typing/pasting text
- [ ] Global templates reduce duplication across projects
- [ ] Template soft-delete prevents breaking historical data
- [ ] JSON structure supports all channel types without schema changes

---

## Estimated Effort

- **Backend**: 3-4 hours (table + 5 API endpoints)
- **Frontend**: 6-8 hours (templates section + project settings integration)
- **Testing**: 2-3 hours
- **Total**: ~12-15 hours for first workable version
