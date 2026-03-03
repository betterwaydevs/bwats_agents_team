# L7: Downloads Section — Test Specification

## Test Environment

- **Backend**: Xano dev branch (`https://bwats-dev.xano.io/api:zxKY0AGs`)
- **Frontend**: Local dev server (`http://localhost:8080`)
- **Auth**: Use `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` from `bwats_xano/.env`

---

## Backend API Tests (hurl)

### Test 1: List Tools (Authenticated)

**File**: `bwats_xano/tests/tools_list.hurl`

```hurl
# Test: List all active downloadable tools
GET https://bwats-dev.xano.io/api:zxKY0AGs/tools/list
Authorization: Bearer {{auth_token}}

HTTP 200
[Asserts]
jsonpath "$.tools" isCollection
jsonpath "$.tools" count >= 1
jsonpath "$.tools[0].name" exists
jsonpath "$.tools[0].slug" exists
jsonpath "$.tools[0].description" exists
jsonpath "$.tools[0].tool_type" exists
jsonpath "$.tools[0].current_version" exists
jsonpath "$.tools[0].download_url" exists
jsonpath "$.tools[0].platform" exists
jsonpath "$.tools[0].updated_at" exists
jsonpath "$.tools[0].is_active" == true
```

**Setup**:
```bash
# Get auth token first
AUTH_TOKEN=$(hurl bwats_xano/tests/auth_login.hurl | jq -r '.authToken')
export auth_token=$AUTH_TOKEN
```

---

### Test 2: List Tools (Unauthenticated)

**File**: `bwats_xano/tests/tools_list_unauth.hurl`

```hurl
# Test: Verify authentication is required
GET https://bwats-dev.xano.io/api:zxKY0AGs/tools/list

HTTP 401
[Asserts]
jsonpath "$.message" contains "Unauthorized"
```

---

### Test 3: Get Tool by Slug (Authenticated)

**File**: `bwats_xano/tests/tools_get_by_slug.hurl`

```hurl
# Test: Get specific tool details by slug
GET https://bwats-dev.xano.io/api:zxKY0AGs/tools/list
Authorization: Bearer {{auth_token}}

HTTP 200
[Asserts]
jsonpath "$.tools[?(@.slug == 'linked-communication')]" exists
jsonpath "$.tools[?(@.slug == 'linked-communication')].name" == "Linked Communication"
jsonpath "$.tools[?(@.slug == 'linked-communication')].tool_type" == "extension"
```

---

### Test 4: Download Tool (Authenticated)

**File**: `bwats_xano/tests/tools_download.hurl`

```hurl
# Test: Download tool artifact by slug
GET https://bwats-dev.xano.io/api:zxKY0AGs/tools/download/linked-communication
Authorization: Bearer {{auth_token}}

HTTP 200
[Asserts]
header "Content-Disposition" contains "attachment"
# Note: May return redirect (302) if download_url is external
```

---

### Test 5: Download Tool (Invalid Slug)

**File**: `bwats_xano/tests/tools_download_invalid.hurl`

```hurl
# Test: 404 for non-existent tool
GET https://bwats-dev.xano.io/api:zxKY0AGs/tools/download/does-not-exist
Authorization: Bearer {{auth_token}}

HTTP 404
[Asserts]
jsonpath "$.error" == "Tool not found"
```

---

### Test 6: Upload Tool (Admin Token)

**File**: `bwats_xano/tests/tools_upload.hurl`

```hurl
# Test: Upload new version of a tool (admin only)
POST https://bwats-dev.xano.io/api:zxKY0AGs/tools/upload
Authorization: Bearer {{admin_token}}
[MultipartFormData]
slug: linked-communication
version: 1.2.3.5
file: file,test_artifacts/linked-communication.zip;

HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.tool.slug" == "linked-communication"
jsonpath "$.tool.current_version" == "1.2.3.5"
jsonpath "$.tool.download_url" exists
```

**Prerequisites**:
- Create `bwats_xano/tests/test_artifacts/` directory
- Add a dummy `linked-communication.zip` for testing
- Use admin token (Pablo: provide this in `.env` as `ADMIN_TOKEN`)

---

### Test 7: Upload Tool (Non-Admin — should fail)

**File**: `bwats_xano/tests/tools_upload_unauth.hurl`

```hurl
# Test: Regular user cannot upload tools
POST https://bwats-dev.xano.io/api:zxKY0AGs/tools/upload
Authorization: Bearer {{auth_token}}
[MultipartFormData]
slug: linked-communication
version: 1.2.3.5
file: file,test_artifacts/linked-communication.zip;

HTTP 403
[Asserts]
jsonpath "$.error" contains "Admin"
```

---

## Frontend Manual Tests

### Test 1: Unauthenticated Access

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `http://localhost:8080/downloads` (not logged in) | Redirect to `/login` | ⬜ |
| 2 | After redirect, verify URL | Should be `/login?redirect=/downloads` | ⬜ |
| 3 | Login with test credentials | After login, redirect to `/downloads` | ⬜ |

---

### Test 2: Downloads Page Layout

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Navigate to `/downloads` (logged in) | Page loads without errors | ⬜ |
| 2 | Verify page title | "Downloads" heading visible | ⬜ |
| 3 | Count tool cards | At least 3 cards visible (Linked Communication, Cold Recruiting, /ats CLI Skill) | ⬜ |
| 4 | Check card content | Each card shows: name, description, version, platform, file size (if available), updated date | ⬜ |
| 5 | Check card actions | Each card has a "Download" button | ⬜ |

---

### Test 3: Download Functionality

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Click "Download" on "Linked Communication" | File download starts OR new tab opens with download URL | ⬜ |
| 2 | Check browser downloads | File appears in downloads folder | ⬜ |
| 3 | Verify filename | Filename includes tool name and version (e.g., `linked-communication-v1.2.3.0.zip`) | ⬜ |

---

### Test 4: Responsive Layout

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Open `/downloads` on desktop (width > 1024px) | Grid shows 2-3 columns | ⬜ |
| 2 | Resize browser to tablet (width 768-1024px) | Grid shows 2 columns | ⬜ |
| 3 | Resize browser to mobile (width < 768px) | Grid shows 1 column | ⬜ |

---

### Test 5: Empty State

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Temporarily set all tools to `is_active = false` in Xano | — | ⬜ |
| 2 | Refresh `/downloads` page | "No downloads available" message displayed | ⬜ |
| 3 | Restore tools to `is_active = true` | — | ⬜ |

---

### Test 6: Error Handling

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Stop Xano backend (simulate API failure) | — | ⬜ |
| 2 | Navigate to `/downloads` | Error toast appears: "Failed to load downloads. Please try again." | ⬜ |
| 3 | Click "Retry" button (if available) | Page attempts to reload data | ⬜ |
| 4 | Restart Xano backend | — | ⬜ |

---

## Integration Tests

### Test 1: End-to-End Download Flow

| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1 | Upload new version via `POST /api/tools/upload` (admin token) | API returns `{ "success": true }` with new version | ⬜ |
| 2 | Refresh `/downloads` page | Tool card shows updated version | ⬜ |
| 3 | Click "Download" on updated tool | New version file downloads | ⬜ |

---

## Performance Tests

### Test 1: Page Load Time

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Time to First Byte (TTFB) | < 200ms | — | ⬜ |
| Page Load (DOMContentLoaded) | < 1s | — | ⬜ |
| Full Page Load (window.onload) | < 2s | — | ⬜ |

**Tool**: Chrome DevTools > Network tab

---

### Test 2: API Response Time

| Endpoint | Target | Actual | Status |
|----------|--------|--------|--------|
| `GET /api/tools/list` | < 300ms | — | ⬜ |
| `GET /api/tools/download/{slug}` | < 500ms (or redirect) | — | ⬜ |

**Tool**: `hurl --very-verbose` (shows timing)

---

## Security Tests

### Test 1: Authentication Required

| Endpoint | Without Auth | Expected Response | Status |
|----------|--------------|-------------------|--------|
| `GET /api/tools/list` | No `Authorization` header | 401 Unauthorized | ⬜ |
| `GET /api/tools/download/{slug}` | No `Authorization` header | 401 Unauthorized | ⬜ |

---

### Test 2: Admin-Only Upload

| User Type | Action | Expected Response | Status |
|-----------|--------|-------------------|--------|
| Regular user | `POST /api/tools/upload` | 403 Forbidden | ⬜ |
| Admin user | `POST /api/tools/upload` | 200 OK | ⬜ |

---

## Regression Tests

### Test 1: Existing Features Still Work

| Feature | Test | Expected Result | Status |
|---------|------|-----------------|--------|
| Login | Login with test credentials | Successful login | ⬜ |
| Dashboard | Navigate to `/` (home) | Dashboard loads | ⬜ |
| People Grid | Navigate to `/people` | People grid loads | ⬜ |

---

## Test Execution Summary

**Total Tests**: 22 (7 backend hurl + 15 frontend manual)

| Category | Passed | Failed | Skipped |
|----------|--------|--------|---------|
| Backend API | — | — | — |
| Frontend UI | — | — | — |
| Integration | — | — | — |
| Performance | — | — | — |
| Security | — | — | — |
| Regression | — | — | — |

**Date Tested**: ___________
**Tested By**: ___________
**Environment**: dev branch (Xano) + local frontend

---

## Known Issues / Notes

_(To be filled during testing)_

---

## Sign-Off

- [ ] All backend hurl tests pass
- [ ] All frontend manual tests pass
- [ ] Performance targets met
- [ ] Security requirements validated
- [ ] No regressions detected

**QA Tester**: ___________
**Date**: ___________
