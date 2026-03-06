# API Reference: Projects, Stages & Associations

**Base URL**: `https://xano.atlanticsoft.co`
**API Group Canonical**: `_dY_2A8p`

## Standard Headers

All endpoints require authentication:
```
Authorization: Bearer {TOKEN}
X-Xano-Authorization: Bearer {TOKEN}
X-Xano-Authorization-Only: true
Content-Type: application/json
```

Add `X-Data-Source: live` as a query parameter: append `?x-data-source=live` (or `&x-data-source=live` if params exist).

## Projects

### GET `/api:_dY_2A8p/project?x-data-source=live`

List all projects. Optional filter: `&status=active` or `&status=closed`.

**Response (200):** Array of project objects:
```json
[
  {
    "id": 1,
    "name": "Senior React Dev",
    "description": "...",
    "location": "LATAM",
    "status": "active",
    "candidate_role_id": 5,
    "prospect_role_id": 3,
    "company_id": 2,
    "created_at": "2025-01-15T...",
    "linked_inmail_subject": "..."
  }
]
```

**Gotcha:** The field `linked_inmail_subject` is a typo in the DB — it should be `linkedin_inmail_subject`. Use `linked_inmail_subject` in API calls.

### GET `/api:_dY_2A8p/project/{id}?x-data-source=live`

Get a single project by ID. Same response shape as above (single object).

### POST `/api:_dY_2A8p/project?x-data-source=live`

Create a new project. **Requires confirmation.**

**Body (all available fields):**
```json
{
  "name": "Senior React Developer",
  "description": "<p>Looking for a senior React dev with 5+ years...</p>",
  "location": "LATAM",
  "status": "active",
  "candidate_role_id": 5,
  "prospect_role_id": 3,
  "company_id": 2,
  "english_validation_url": "https://videoask.com/...",
  "messaging_template": "Hi {{candidate_first_name}}, we have a role...",
  "email_template": "{\"subject\":\"Opportunity: {{project_title}}\",\"body\":\"<p>Hi {{candidate_first_name}}...</p>\"}",
  "linkedin_invite_template": "Hi {{candidate_first_name}}, I'd like to connect...",
  "linkedin_inmail_template": "Hi {{candidate_first_name}}, I found your profile...",
  "linked_inmail_subject": "Exciting opportunity",
  "internal_qualifications_and_notes": "Must have: React, TypeScript, 5+ years",
  "public": false
}
```

**Required fields:** `name`, `location`, `status`, `candidate_role_id`, `prospect_role_id`

**Template variables:** `{{candidate_first_name}}`, `{{candidate_last_name}}`, `{{project_title}}`, `{{apply_link}}`, `{{user_first_name}}`, `{{user_last_name}}`, `{{account_first_name}}`, `{{account_last_name}}`, `{{account_signature}}`

**Gotchas:**
- `description` accepts HTML
- `email_template` is a JSON string with `subject` and `body` keys (body is HTML)
- `linked_inmail_subject` — NOT `linkedin_inmail_subject` (DB typo)
- `linkedin_invite_template` has a 300 character limit
- Stages are NOT created automatically — call `initialize-stages` after creation

### Fetching Roles (for role_id fields)

```
GET /api:wosIWFpR/roles?role_type=candidate_prospecting&x-data-source=live  → candidate roles
GET /api:wosIWFpR/roles?role_type=prospects&x-data-source=live              → prospect roles
```

Returns array of `{ id, name, role_type }`. Use the `id` for `candidate_role_id` / `prospect_role_id`.

### Full Project Creation Flow

1. Ask the user for: project name, location, company, role/JD description
2. Fetch available roles: `GET /roles?role_type=candidate_prospecting` and `GET /roles?role_type=prospects`
3. Present role options — let user pick or suggest based on the JD
4. Build the project body with all fields the user provided
5. **Confirm** with the user before creating
6. `POST /project` to create
7. `GET /project/{id}/initialize-stages?stage_type=prospects` to create prospect pipeline
8. `GET /project/{id}/initialize-stages?stage_type=candidates` to create candidate pipeline
9. Show the created project with its pipeline

### PATCH `/api:_dY_2A8p/project/{id}?x-data-source=live`

Update a project. Send only fields to change.

### DELETE `/api:_dY_2A8p/project/{id}?x-data-source=live`

Delete a project. **Requires confirmation.**

## Stages

### GET `/api:_dY_2A8p/project/{projectId}/stages?stage_type={type}&x-data-source=live`

Get stages for a project. `stage_type` is `prospects` or `candidates`.

**Response (200):** Array of stage objects:
```json
[
  {
    "id": 101,
    "name": "New Lead",
    "sort_order": 1,
    "color": "#3498db",
    "is_terminal": false,
    "stage_type": "prospects",
    "stage_action": "none",
    "project_id": 1
  }
]
```

### GET `/api:_dY_2A8p/project/{projectId}/initialize-stages?stage_type={type}&x-data-source=live`

Initialize default stages for a project (if none exist).

## Stage Counts

### GET `/api:_dY_2A8p/association/project/{projectId}/people/count?stage_type={type}&x-data-source=live`

Get count of people in each stage.

**Response (200):**
```json
{
  "stages": [
    { "stage_id": 101, "stage_name": "New Lead", "sort_order": 1, "count": 15 },
    { "stage_id": 102, "stage_name": "Contacted", "sort_order": 2, "count": 8 }
  ],
  "total": 23
}
```

## People in Stages (Paginated)

### GET `/api:_dY_2A8p/association/project/{projectId}/people?x-data-source=live`

List people in a project. Supports pagination and filtering.

**Query parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `stage_id` | No | Filter by specific stage |
| `stage_type` | No | `prospects` or `candidates` |
| `page` | No | Page number (default 1) |
| `per_page` | No | Items per page (default 20) |
| `has_score` | No | `scored` or `unscored` |
| `score_min` | No | Minimum score filter |
| `score_max` | No | Maximum score filter |
| `sort_by` | No | `updated_at`, `created_at`, or `score` |
| `sort_order` | No | `asc` or `desc` |

**Response (200):** Paginated response:
```json
{
  "items": [
    {
      "id": 501,
      "project_id": 1,
      "person_id": 42,
      "person_type": "prospect",
      "elastic_search_id": "abc123",
      "current_stage_id": 101,
      "last_note": "Looks promising",
      "created_at": 1706000000,
      "updated_at": 1706100000,
      "_person": {
        "first_name": "Jane",
        "last_name": "Doe",
        "linkedin_profile": "https://linkedin.com/in/janedoe",
        "country": "Colombia"
      }
    }
  ],
  "itemsTotal": 45,
  "itemsReceived": 20,
  "curPage": 1,
  "nextPage": 2
}
```

**Note:** Some endpoints may return a plain array instead of paginated object. Always handle both shapes.

## Search Within Project

### POST `/api:_dY_2A8p/association/search?x-data-source=live`

Search for people within a project by keyword.

**Body:**
```json
{
  "keyword": "Jane",
  "project_id": 1,
  "stage_type": "prospects",
  "per_page": 50,
  "page": 1
}
```

**Response:** Same paginated shape as people listing (or plain array).

## Assign Person to Stage

### POST `/api:_dY_2A8p/association/project/{projectId}/people?x-data-source=live`

Assign an existing person to a stage in a project. **Requires confirmation.**

**Body:**
```json
{
  "project_id": 1,
  "person_id": 42,
  "elastic_search_id": "abc123",
  "person_type": "prospect",
  "current_stage_id": 101,
  "last_note": "Optional note"
}
```

## Change Stage

### POST `/api:_dY_2A8p/association/id/{associationId}/change-stage?x-data-source=live`

Move a person to a different stage. **Requires confirmation.**

**Body:**
```json
{
  "project_person_association_id": 501,
  "stage_id": 102,
  "notes": "Reason for the move",
  "activity_type": "stage_change"
}
```

## Remove Person from Project

### DELETE `/api:_dY_2A8p/association/{associationId}?x-data-source=live`

Remove a person from a project (deletes association and related data). **Requires confirmation.**

**Response (200):**
```json
{
  "deleted_association_id": 501,
  "person_id": 42,
  "person_type": "prospect",
  "project_id": 1,
  "deleted_tasks": 0,
  "deleted_touchpoints": 2,
  "deleted_history": 3,
  "deleted_events": 1
}
```

**Errors:**
- `412` — Person has active tasks (must complete/cancel first)
- `404` — Association not found (already removed)

## Get Person's Associations

### GET `/api:_dY_2A8p/association/person/{personType}/{elasticSearchId}?x-data-source=live`

Get all project associations for a person. `personType` is `candidate` or `prospect`.

**Response (200):** Array of association objects.
