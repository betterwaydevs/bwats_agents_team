# API Reference: Candidates, Prospects & People

**Base URL**: `https://xano.atlanticsoft.co`

## Standard Headers

```
Authorization: Bearer {TOKEN}
X-Xano-Authorization: Bearer {TOKEN}
X-Xano-Authorization-Only: true
Content-Type: application/json
```

Add `?x-data-source=live` (or `&x-data-source=live`) to all URLs.

---

## Candidates (Canonical: `wosIWFpR`)

### GET `/api:wosIWFpR/parsed_candidate_info/{elasticSearchId}?x-data-source=live`

Get full candidate details by ElasticSearch ID.

**Response (200):** Candidate object with all parsed fields:
```json
{
  "id": 42,
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "linkedin_profile": "https://linkedin.com/in/janedoe",
  "country": "Colombia",
  "city": "Bogota",
  "salary_aspiration": 5000,
  "phone": "+57...",
  "skills": [...],
  "work_history": [...],
  "education": [...],
  "notes": "Internal notes here",
  "elastic_search_document_id": "abc123"
}
```

### PATCH `/api:wosIWFpR/parsed_candidate/{candidateId}?x-data-source=live`

Update candidate fields. `candidateId` is the internal DB ID (not ES ID).

**Body:** Only send fields to update:
```json
{
  "first_name": "Janet",
  "email": "janet@example.com",
  "salary_aspiration": 6000
}
```

**Available fields:** `first_name`, `last_name`, `email`, `linkedin_profile`, `salary_aspiration`, `country`, `city`, `phone`

### POST `/api:wosIWFpR/candidates/update_notes?x-data-source=live`

Update internal notes for a candidate. **No confirmation needed.**

**Body:**
```json
{
  "candidate_es_id": "abc123",
  "notes": "Updated notes content"
}
```

### POST `/api:wosIWFpR/candidate/quick_create?x-data-source=live`

Quick-create a candidate and assign to a project stage. **Requires confirmation.**

**Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "linkedin_profile": "https://linkedin.com/in/janedoe",
  "project_id": 1,
  "stage_id": "101",
  "email": "jane@example.com"
}
```

**Response (200):**
```json
{
  "candidate": {
    "id": 42,
    "first_name": "Jane",
    "last_name": "Doe",
    "elastic_search_document_id": "abc123"
  },
  "association": {
    "id": 501,
    "project_id": 1,
    "current_stage_id": 101
  },
  "statuses": {
    "candidate_created": true,
    "stage_assigned": true
  },
  "stage_history_id": 15
}
```

### POST `/api:wosIWFpR/search/candidates?x-data-source=live`

Search candidates with filters.

**Body (all available fields):**
```json
{
  "keyword_search": "react developer",
  "must_skills": [
    { "variations": ["React", "ReactJS"], "min_months": 24 }
  ],
  "should_skills": [
    { "variations": ["TypeScript", "TS"], "min_months": 12 }
  ],
  "max_salary": 8000,
  "min_year_of_experience": 3,
  "max_years_of_experience": 10,
  "english_levels": ["C1", "C2", "Native"],
  "countries": ["Colombia", "Mexico"],
  "city": "Bogota",
  "role": "Frontend Developer",
  "notes": "",
  "page": 1,
  "item_per_page": 20,
  "hide_ids": ["existingEsId1", "existingEsId2"]
}
```

**Field notes:**
- `must_skills`: Required skills. Each has `variations` (array of synonyms) and `min_months` (minimum experience).
- `should_skills`: Nice-to-have skills. Same shape as `must_skills`.
- `hide_ids`: ES IDs to exclude from results (already in pipeline, etc.)
- `english_levels`: Filter by English proficiency level.
- `item_per_page`: Controls page size. **Use 20-50 max** to avoid timeouts on large datasets.
- `page`: 1-indexed. Increment for pagination.

**Response (200):** ElasticSearch-style response:
```json
{
  "hits": {
    "total": { "value": 150 },
    "hits": [
      {
        "_id": "abc123",
        "_source": {
          "first_name": "Jane",
          "last_name": "Doe",
          "email": "jane@example.com",
          "linkedin_profile": "https://linkedin.com/in/janedoe",
          "country": "Colombia",
          "city": "Bogota",
          "salary_aspiration": 5000,
          "skills": ["React", "TypeScript"],
          "years_of_experience": 5,
          "english_level": "C1"
        }
      }
    ]
  }
}
```

**Pagination:** Check `hits.total.value` for total count. If > `item_per_page`, increment `page` for next batch. Show "Page X of Y" to user.

**Gotcha:** Large projects (1000+ prospects) may cause 502 timeouts on search. Use `item_per_page: 20` and paginate.

---

## Prospects (Canonical: `zE_czJ22`)

### GET `/api:zE_czJ22/parsed_prospect/{elasticSearchId}?x-data-source=live`

Get full prospect details by ElasticSearch ID. Same shape as candidate response.

### PATCH `/api:zE_czJ22/parsed_prospect/{prospectId}?x-data-source=live`

Update prospect fields. `prospectId` is the internal DB ID. Same fields as candidate PATCH.

### POST `/api:zE_czJ22/update_notes?x-data-source=live`

Update internal notes for a prospect. **No confirmation needed.**

**Body:**
```json
{
  "prospec_es_id": "def456",
  "notes": "Updated prospect notes"
}
```

**GOTCHA:** The field is `prospec_es_id` (NOT `prospect_es_id`). This is a typo in the API that must be matched exactly.

### POST `/api:zE_czJ22/search/prospects?x-data-source=live`

Search prospects. Same body shape and response as candidate search above.

### GET `/api:zE_czJ22/search/total_count?x-data-source=live`

Get total prospect count.

---

## Person Associations (Cross-Reference)

To get a person's project associations, use the endpoint from `api-projects.md`:

```
GET /api:_dY_2A8p/association/person/{personType}/{personId}?x-data-source=live
```

**GOTCHA:** `personId` must be the **Xano internal integer ID** (e.g., `42` from `parsed_prospect.id`), NOT the ElasticSearch string ID (e.g., `"abc123"`). Using the ES ID returns 404.

To get the internal ID from an ES ID:
1. Call `GET /parsed_candidate_info/{esId}` or `GET /parsed_prospect/{esId}`
2. Use the `id` field from the response

`personType` is `candidate` or `prospect`.

---

## Events (Canonical: `wosIWFpR`)

### GET `/api:wosIWFpR/candidate_event?candidate_id={id}&x-data-source=live`

Get events/activities for a person by their internal candidate ID.

**Response (200):** Array of event objects:
```json
[
  {
    "id": 1,
    "candidate_id": 42,
    "event_type": "stage_change",
    "details": "Moved from New Lead to Contacted",
    "created_at": "2025-06-01T..."
  }
]
```

### POST `/api:wosIWFpR/events_by_associations?x-data-source=live`

Get events for multiple people at once by association IDs.

**Body:**
```json
{
  "association_ids": [501, 502, 503]
}
```
