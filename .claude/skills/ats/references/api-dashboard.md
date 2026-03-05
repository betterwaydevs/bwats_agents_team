# API Reference: Recruiter Dashboard — Applications, Events & LinkedIn

**Base URL**: `https://xano.atlanticsoft.co`

## Standard Headers

```
Authorization: Bearer {TOKEN}
X-Xano-Authorization: Bearer {TOKEN}
X-Xano-Authorization-Only: true
Content-Type: application/json
```

Add `?x-data-source=live` to all URLs.

---

## Applications (Canonical: `wosIWFpR`)

### GET `/api:wosIWFpR/applications/applicants?x-data-source=live`

List job applications with pagination and filtering.

**Query parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `page` | No | Page number (default 1) |
| `per_page` | No | Items per page (default 20) |
| `status` | No | `pending` or `read` |
| `keyword` | No | Search by name or email |

**Response (200):**
```json
{
  "itemsReceived": 5,
  "curPage": 1,
  "nextPage": 2,
  "prevPage": null,
  "itemsTotal": 100,
  "pageTotal": 4,
  "items": [
    {
      "id": 123,
      "application_id": "app_uuid",
      "candidate_id": 456,
      "created_at": 1704067200000,
      "applicant_name": "John Doe",
      "applicant_email": "john@example.com",
      "applicant_phone": "+1234567890",
      "project_id": 789,
      "linked_url": "https://linkedin.com/in/johndoe",
      "status": "pending",
      "resume": { "access": "private", "path": "..." },
      "resume_url": "https://signed-url.com/resume.pdf",
      "_project": { "id": 789, "name": "Engineering Lead" },
      "_parsed_candidate": {
        "id": 456,
        "first_name": "John",
        "last_name": "Doe",
        "elastic_search_document_id": "es_doc_id"
      }
    }
  ]
}
```

**Key fields:**
- `status`: `pending` (new, unprocessed) or `read` (reviewed)
- `resume_url`: Signed URL for the resume PDF (if private)
- `_project`: Joined project info
- `_parsed_candidate`: Joined candidate profile (may be null if unmatched)

### PATCH `/api:wosIWFpR/applications/{application_notification_id}?x-data-source=live`

Update application status.

**Body:**
```json
{
  "status": "read"
}
```

### Processing an Application

Typical flow:
1. List pending applications: `GET /applications/applicants?status=pending`
2. Review applicant details (name, email, LinkedIn, resume)
3. If matched to candidate: view full profile via `GET /parsed_candidate_info/{esId}`
4. Decide: assign to project stage, mark as read, or skip
5. Mark processed: `PATCH /applications/{id}` with `{"status": "read"}`
6. Optionally: assign to project via `POST /association/project/{id}/people`

---

## Candidate Events (Canonical: `wosIWFpR`)

### GET `/api:wosIWFpR/candidate_events?x-data-source=live`

List scheduled events (interviews, calls, etc.).

**Query parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `status` | No | `pending` or `completed` |
| `project_person_association_id` | No | Filter by specific person association |

**Response (200):** Array of event objects:
```json
[
  {
    "id": 1,
    "candidate_id": 42,
    "project_person_association_id": 501,
    "title": "Technical Interview",
    "scheduled_at": 1704067200000,
    "status": "pending",
    "created_at": 1703980800000,
    "_project_person_association": {
      "id": 501,
      "project_id": 1,
      "person_id": 42,
      "person_type": "candidate",
      "elastic_search_id": "abc123",
      "_project": { "id": 1, "name": "Senior React Dev" },
      "_parsed_candidate": {
        "id": 42,
        "first_name": "Jane",
        "last_name": "Doe"
      }
    }
  }
]
```

**Note:** `scheduled_at` is Unix timestamp in **milliseconds**.

### POST `/api:wosIWFpR/candidate_event?x-data-source=live`

Create a new event. **Requires confirmation.**

**Body:**
```json
{
  "candidate_id": 42,
  "project_person_association_id": 501,
  "title": "Final Interview",
  "scheduled_at": 1704067200000
}
```

### PATCH `/api:wosIWFpR/candidate_event/{eventId}?x-data-source=live`

Update an event (reschedule, mark complete, etc.).

**Body (send only fields to change):**
```json
{
  "title": "Rescheduled Interview",
  "scheduled_at": 1704153600000,
  "status": "completed"
}
```

---

## LinkedIn Events (Canonical: `wZiyNifh`)

### GET `/api:wZiyNifh/linked_in_events?x-data-source=live`

Get recent LinkedIn connection and invitation events.

**Query parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `timestamp` | No | Unix ms timestamp — only return events after this time. Default: 24 hours ago |

**Response (200):** Array of LinkedIn events:
```json
[
  {
    "id": 1,
    "created_at": 1704067200000,
    "user_id": 1,
    "First_Name": "Maria",
    "Last_Name": "Garcia",
    "Connection_Profile_URL": "https://linkedin.com/in/mariagarcia",
    "Email_Address": "maria@company.com",
    "Company": "TechCorp",
    "Position": "Senior Developer",
    "Connected_On": 1704067200000,
    "Message": "Thanks for connecting!",
    "event_date": 1704067200000,
    "event_type": "connection",
    "person_type": "prospect",
    "person_id": 123,
    "elastic_search_document_id": "def456",
    "_user": { "id": 1, "name": "Karen Polanco" }
  }
]
```

**Event types:** `connection` (accepted) or `invitation` (pending)

**Enrichment:** Events are cross-referenced with the ATS database — if the LinkedIn profile matches a known candidate/prospect, `person_type`, `person_id`, and `elastic_search_document_id` are populated.

---

## Tasks (Canonical: `i2KWpEI8`)

### GET `/api:i2KWpEI8/tasks?x-data-source=live`

List tasks (outreach actions, scoring, etc.).

**Query parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `project_id` | No | Filter by project |
| `status` | No | `pending`, `executing`, `done`, `skipped`, `failed` |
| `person_type` | No | `candidate` or `prospect` |
| `assignee_type` | No | `user`, `agent`, `system`, `unassigned` |
| `page` | No | Page (default 1) |
| `per_page` | No | Per page (default 50) |
| `sort_by` | No | `created_at` (default) |
| `sort_order` | No | `asc` or `desc` |

### GET `/api:i2KWpEI8/tasks/counts?x-data-source=live`

Get task counts grouped by project and status.

**Response (200):**
```json
{
  "total": 150,
  "by_project": [
    {
      "project_id": 1,
      "project_name": "Senior React Dev",
      "total": 45,
      "by_status": {
        "pending": 20,
        "done": 15,
        "executing": 5,
        "skipped": 3,
        "failed": 2
      }
    }
  ]
}
```
