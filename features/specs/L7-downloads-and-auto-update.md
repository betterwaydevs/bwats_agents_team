# L7: Downloads Section & Extension Auto-Update

**Priority**: Medium
**Type**: ~~BOTH (Frontend + Backend)~~ **Frontend Only** (Backend completed manually)
**Projects**: nearshore-talent-compass, ~~bwats_xano~~ (backend done)
**Status**: Backend APIs complete (manual) — Frontend implementation pending

## Summary

Add a "Downloads" section to the ATS dashboard where logged-in users can download internal tools (extensions, CLI skills). Includes backend storage for tool metadata and a manual upload mechanism for Claude Code to push new builds.

**Out of Scope (moved to L7-EXT)**: Extension auto-update checking logic. L7 provides the infrastructure; L7-EXT will consume it.

---

## Part 1: Backend — Tool Registry & File Storage ✅ COMPLETED MANUALLY

**Status**: Backend APIs created manually in Xano UI (2026-03-03) under `virtual_machines_and_tools` group. Merged to dev from live.

- ✅ `GET /api/tools/list` (#44940)
- ✅ `GET /api/tools/download/{slug}` (#44941)
- ✅ `POST /api/tools/upload` (#44939)

### Database Table: `downloadable_tools`

| Column | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| `id` | integer | Primary key | Y | auto |
| `name` | text | Tool display name (e.g., "Linked Communication") | Y | — |
| `slug` | text | URL-safe identifier (e.g., "linked-communication") | Y | — |
| `description` | text | Short description of the tool | Y | — |
| `tool_type` | text | Type: "extension", "skill", "cli", "other" | Y | — |
| `current_version` | text | Semantic version (e.g., "1.2.3.4") | Y | — |
| `download_url` | text | URL to the artifact (zip, tar.gz, etc.) | Y | — |
| `platform` | text | Platform/requirements (e.g., "Chrome", "Claude Code", "Windows/Mac/Linux") | N | null |
| `file_size_mb` | float | File size in MB | N | null |
| `updated_at` | timestamp | Last updated timestamp | Y | now() |
| `created_at` | timestamp | Creation timestamp | Y | now() |
| `created_by` | integer | FK to `user.id` | N | null |
| `is_active` | bool | Whether tool appears in downloads list | Y | true |

**Indexes**:
- Unique index on `slug`
- Index on `tool_type`
- Index on `is_active`

---

### API Endpoints

#### 1. `GET /api/tools/list` (Authenticated)
Returns list of downloadable tools for authenticated users.

**Request**:
```
GET /api/tools/list
Authorization: Bearer <token>
```

**Response**:
```json
{
  "tools": [
    {
      "id": 1,
      "name": "Linked Communication",
      "slug": "linked-communication",
      "description": "LinkedIn automation companion panel",
      "tool_type": "extension",
      "current_version": "1.2.3.4",
      "download_url": "https://bwats-dev.xano.io/api:zxKY0AGs/tools/download/linked-communication",
      "platform": "Chrome",
      "file_size_mb": 2.5,
      "updated_at": "2026-03-03T14:30:00Z"
    }
  ]
}
```

**Logic**:
- Filter `downloadable_tools` where `is_active = true`
- Order by `tool_type`, then `name`
- Return all fields except `created_by`

---

#### 2. `GET /api/tools/download/{slug}` (Authenticated)
Serves the file artifact for a given tool.

**Request**:
```
GET /api/tools/download/linked-communication
Authorization: Bearer <token>
```

**Response**:
- **Success (200)**: Binary file stream with `Content-Disposition: attachment; filename="linked-communication-v1.2.3.4.zip"`
- **Not Found (404)**: `{ "error": "Tool not found" }`
- **Unauthorized (401)**: `{ "error": "Authentication required" }`

**Logic**:
- Look up tool by `slug` where `is_active = true`
- Serve the file from `download_url` (if stored in Xano file storage) OR redirect to external URL
- Log download event (optional telemetry)

---

#### 3. `POST /api/tools/upload` (Admin only — manual upload via Claude Code)
Uploads a new build artifact and updates the tool registry.

**Request**:
```
POST /api/tools/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "slug": "linked-communication",
  "version": "1.2.3.4",
  "file": <binary file upload>
}
```

**Response**:
```json
{
  "success": true,
  "tool": {
    "id": 1,
    "name": "Linked Communication",
    "slug": "linked-communication",
    "current_version": "1.2.3.4",
    "download_url": "https://bwats-dev.xano.io/api:zxKY0AGs/tools/download/linked-communication"
  }
}
```

**Logic**:
- Verify user has admin permissions
- Look up tool by `slug`
- Upload file to Xano file storage
- Update `downloadable_tools`: set `current_version`, `download_url`, `file_size_mb`, `updated_at`
- Return updated tool record

---

## Part 2: Frontend — Downloads Page

### Route: `/downloads`

**Location**: `nearshore-talent-compass/src/pages/Downloads.tsx`

**Layout**:
- Page title: "Downloads"
- Grid layout (responsive: 1 column mobile, 2-3 columns desktop)
- Each card shows:
  - Tool name
  - Description
  - Version badge (e.g., "v1.2.3.4")
  - Platform badge (e.g., "Chrome Extension")
  - File size
  - "Download" button
  - Last updated timestamp

**API Integration**:
- On mount: `GET /api/tools/list` (authenticated)
- On "Download" click: `window.open(tool.download_url)` (opens download in new tab)

**Error Handling**:
- If API fails: show error toast + retry button
- If no tools available: show empty state with message

---

## Part 3: Manual Changes (Pablo) ✅ BACKEND COMPLETE

### 3.1 ~~Create Xano Table `downloadable_tools`~~ ✅ DONE

~~In Xano UI (dev branch), create table with schema above.~~ Completed manually.

### 3.2 ~~Seed Initial Tools~~ ✅ DONE

~~Insert 3 initial records~~ Completed as part of backend implementation.

### 3.3 Add Route in Frontend ⬜ PENDING

Add to navigation:
- Route: `/downloads`
- Icon: Download icon (lucide-react `Download`)
- Position: After "Settings" in sidebar

**This is the only remaining manual change** — frontend route needs to be added.

---

## Part 4: Test Specifications

### Backend Tests (hurl) — OPTIONAL (APIs already live)

Since the backend APIs were created manually and are already live, hurl tests are optional. QA can test the APIs directly via curl or the frontend integration.

If hurl tests are desired, here are the specs:

#### Test 1: List Tools (Authenticated)
```hurl
# File: bwats_xano/tests/tools_list.hurl
GET https://bwats-dev.xano.io/api:zxKY0AGs/tools/list
Authorization: Bearer {{auth_token}}

HTTP 200
[Asserts]
jsonpath "$.tools" isCollection
jsonpath "$.tools[0].name" exists
jsonpath "$.tools[0].slug" exists
jsonpath "$.tools[0].current_version" exists
jsonpath "$.tools[0].download_url" exists
```

#### Test 2: Download Tool by Slug (Authenticated)
```hurl
# File: bwats_xano/tests/tools_download.hurl
GET https://bwats-dev.xano.io/api:zxKY0AGs/tools/download/linked-communication
Authorization: Bearer {{auth_token}}

HTTP 200
[Asserts]
header "Content-Disposition" contains "attachment"
```

---

### Frontend Tests (Manual QA Checklist)

| Step | Expected Result | Status |
|------|-----------------|--------|
| Navigate to `/downloads` without login | Redirect to login page | ⬜ |
| Login and navigate to `/downloads` | Page loads, shows tool grid | ⬜ |
| Verify tool cards show all metadata | Name, description, version, platform, file size, updated date | ⬜ |
| Click "Download" on a tool | File download starts | ⬜ |
| Check empty state | If no tools, show "No downloads available" message | ⬜ |
| Test on mobile | Layout is responsive (1 column) | ⬜ |
| Test on desktop | Layout shows 2-3 columns | ⬜ |

---

## Acceptance Criteria

### Backend ✅ COMPLETE (manual implementation)
- [x] AC1: `downloadable_tools` table exists in Xano with correct schema
- [x] AC2: `GET /api/tools/list` returns active tools for authenticated users
- [x] AC3: `GET /api/tools/download/{slug}` serves file artifacts
- [x] AC4: `POST /api/tools/upload` allows admin to push new builds

### Frontend ⬜ PENDING
- [ ] AC5: `/downloads` page in ATS displays tool grid with download buttons
- [ ] AC6: Clicking "Download" triggers file download
- [ ] AC7: ~~All hurl tests pass~~ (optional — backend live)
- [ ] AC8: Manual QA checklist complete

---

## Dependencies

- **L5** (/ats CLI Skill) — one of the initial downloadable tools
- **L7-EXT** (NEW) — Extension auto-update checking logic (depends on L7)

---

## Future Enhancements (Out of Scope)

- Auto-update extension version on git push (CI/CD integration)
- Download telemetry (track who downloads what, when)
- Version history (allow users to download older versions)
- Release notes per version
