# L7: Manual Changes Required (Pablo)

## Overview

~~This document lists all manual changes Pablo needs to make in Xano UI before the backend-developer and frontend-developer agents can implement L7.~~

**STATUS: BACKEND APIS COMPLETED MANUALLY** (2026-03-03)

Pablo created the backend APIs manually in Xano UI under the `virtual_machines_and_tools` group (renamed from "Brutal Machines") on the live branch and merged them to dev. The following items are now DONE:

- ✅ `GET /api/tools/list` (#44940)
- ✅ `GET /api/tools/download/{slug}` (#44941)
- ✅ `POST /api/tools/upload` (#44939)

All backend work is complete. Only frontend implementation remains.

---

## 1. Create Xano Table: `downloadable_tools`

**Location**: Xano UI → Database → Add Table

### Schema

| Column Name | Type | Constraints | Default | Notes |
|-------------|------|-------------|---------|-------|
| `id` | integer | Primary Key, Auto-increment | — | Xano auto-creates this |
| `name` | text | NOT NULL | — | Tool display name |
| `slug` | text | NOT NULL, UNIQUE | — | URL-safe identifier |
| `description` | text | NOT NULL | — | Short description |
| `tool_type` | text | NOT NULL | — | "extension", "skill", "cli", "other" |
| `current_version` | text | NOT NULL | — | Semantic version (e.g., "1.2.3.4") |
| `download_url` | text | NOT NULL | — | URL to artifact or Xano file storage path |
| `platform` | text | nullable | null | Platform info (e.g., "Chrome", "Claude Code") |
| `file_size_mb` | float | nullable | null | File size in MB |
| `updated_at` | timestamp | NOT NULL | now() | Last updated timestamp |
| `created_at` | timestamp | NOT NULL | now() | Creation timestamp |
| `created_by` | integer | nullable, FK to `user.id` | null | User who created this record |
| `is_active` | bool | NOT NULL | true | Whether tool appears in downloads list |

### Indexes to Add

1. **Unique index** on `slug` (prevents duplicate slugs)
2. **Index** on `tool_type` (for filtering by type)
3. **Index** on `is_active` (for filtering active tools)

### Steps in Xano UI

1. Go to **Database** tab
2. Click **+ Add Table**
3. Name it `downloadable_tools`
4. Add each column from the table above with the specified type and constraints
5. After creating table, go to **Indexes** section:
   - Add unique index on `slug`
   - Add regular index on `tool_type`
   - Add regular index on `is_active`

---

## 2. Seed Initial Tool Records

**Location**: Xano UI → Database → `downloadable_tools` → Add Records

Insert these 3 records manually:

### Record 1: Linked Communication

| Field | Value |
|-------|-------|
| `name` | Linked Communication |
| `slug` | linked-communication |
| `description` | LinkedIn automation companion panel with AI-powered messaging |
| `tool_type` | extension |
| `current_version` | 1.2.3.0 |
| `download_url` | _(leave empty — will be populated after first upload)_ |
| `platform` | Chrome |
| `file_size_mb` | _(leave empty)_ |
| `is_active` | true |
| `created_by` | _(your user ID or leave null)_ |

### Record 2: Cold Recruiting

| Field | Value |
|-------|-------|
| `name` | Cold Recruiting |
| `slug` | cold-recruiting |
| `description` | Sales outreach extension for B2B prospecting |
| `tool_type` | extension |
| `current_version` | 1.0.0 |
| `download_url` | _(leave empty — will be populated after first upload)_ |
| `platform` | Chrome |
| `file_size_mb` | _(leave empty)_ |
| `is_active` | true |
| `created_by` | _(your user ID or leave null)_ |

### Record 3: /ats CLI Skill

| Field | Value |
|-------|-------|
| `name` | /ats CLI Skill |
| `slug` | ats-cli-skill |
| `description` | Interactive ATS interface for Claude Code CLI |
| `tool_type` | skill |
| `current_version` | 0.1.0 |
| `download_url` | _(leave empty — will be populated after first upload)_ |
| `platform` | Claude Code |
| `file_size_mb` | _(leave empty)_ |
| `is_active` | true |
| `created_by` | _(your user ID or leave null)_ |

### Steps in Xano UI

1. Go to **Database** → `downloadable_tools`
2. Click **+ Add Record** (3 times, once per tool)
3. Fill in the fields as shown above
4. `updated_at` and `created_at` will auto-populate
5. Leave `download_url` and `file_size_mb` empty for now — these will be populated when you upload the first build

---

## 3. Add Admin Permission Check

**What**: Verify your user account has admin permissions (for `POST /api/tools/upload`)

**Location**: Xano UI → Database → `user` table

### Steps

1. Find your user record in the `user` table
2. Check the `role` or `is_admin` field (or equivalent permission field)
3. If no admin field exists, we'll need to add logic in the API to check user ID or create a permission flag

**Note for backend-developer**: The `POST /api/tools/upload` endpoint should verify:
```javascript
// Pseudocode
if (authToken.user.id !== 1 && authToken.user.role !== 'admin') {
  return { error: 'Admin privileges required', status: 403 }
}
```

If there's no existing admin check, we can hardcode Pablo's user ID for now.

---

## 4. Create API Group: `TOOLS` (Optional but Recommended)

**What**: Organize the new endpoints under a dedicated API group

**Location**: Xano UI → API → Add API Group

### Steps

1. Go to **API** tab
2. Click **+ Add API Group**
3. Name it `TOOLS` or `DOWNLOADS`
4. Set the base path to `/tools` or `/downloads`
5. Enable authentication for the group (requires `authToken`)

**Note**: If you skip this step, the backend-developer can add endpoints to an existing API group (e.g., `AUTH` or `CANDIDATES`). But a dedicated group is cleaner.

---

## 5. Set Up File Storage (for artifacts)

**What**: Configure where uploaded `.zip` files will be stored

**Options**:

### Option A: Use Xano File Storage (Recommended)
- Xano has built-in file upload support
- Files stored in Xano's cloud storage
- `download_url` will be a Xano-hosted URL like `https://xano-files.s3.amazonaws.com/...`

**Steps**:
1. No manual setup needed — Xano handles this automatically when you use file upload inputs
2. The `POST /api/tools/upload` endpoint will store the file and return the URL

### Option B: Use External Storage (e.g., S3, Cloudflare R2)
- More control over storage location
- Requires configuring S3 credentials in Xano

**Steps**:
1. Go to **Settings** → **Integrations** → **AWS S3**
2. Add your S3 credentials
3. The backend-developer will use `aws.upload_file()` in the upload endpoint

**Recommendation**: Go with **Option A** for simplicity unless you have a specific reason to use external storage.

---

## 6. Create Test Admin Token

**What**: Generate an admin-level auth token for testing `POST /api/tools/upload`

**Location**: Xano UI → Users → Your User → Generate Token

### Steps

1. Go to **Database** → `user` → find your user record
2. Click on your user to view details
3. Use the **Xano API Playground** to generate an auth token:
   - Endpoint: `POST /auth/login`
   - Body: `{ "email": "your-email@example.com", "password": "your-password" }`
   - Copy the `authToken` from the response
4. Save this token in `bwats_xano/.env` as `ADMIN_TOKEN=<token>`

**Note**: This token is for testing only. In production, you'll generate fresh tokens via the login flow.

---

## 7. Update `.env` File

**What**: Add the admin token to the environment variables for testing

**Location**: `bwats_xano/.env`

### Add This Line

```bash
# Admin token for testing tools upload endpoint
ADMIN_TOKEN=your-admin-auth-token-here
```

**How to Get the Token**: See step 6 above.

---

## Summary Checklist

Backend APIs completed manually by Pablo (2026-03-03):

- [x] 1. Created backend APIs in `virtual_machines_and_tools` group
- [x] 2. `GET /api/tools/list` (#44940) — implemented
- [x] 3. `GET /api/tools/download/{slug}` (#44941) — implemented
- [x] 4. `POST /api/tools/upload` (#44939) — implemented
- [x] 5. APIs created on live branch and merged to dev
- [ ] 6. ~~Manual Xano table creation~~ (handled by backend APIs)
- [ ] 7. ~~Admin token setup~~ (handled by backend implementation)

---

## What Happens Next

~~Once you've completed these steps:~~

**Backend APIs are complete.** Next steps:

1. ~~The **backend-developer** agent will create the 3 API endpoints~~ ✅ DONE (manual)

2. The **frontend-developer** agent will:
   - Create the `/downloads` page UI
   - Add the route to the navigation
   - Integrate with the backend endpoints

3. The **qa-tester** agent will:
   - ~~Run hurl tests against the backend~~ (optional — backend is already live)
   - Perform manual UI testing on the frontend
   - Verify all acceptance criteria

---

## Questions?

If anything is unclear or you run into issues:

1. Ask in the team chat — I'll clarify
2. Check `LEARNINGS.md` for related gotchas
3. Ping me if the table schema needs adjustment

**Estimated time for manual steps**: ~20 minutes
