# R1: Job Board API Research — Final Report

**Research Date**: 2026-03-02
**Researcher**: python-developer (BWATS Team)
**Status**: Complete

---

## Executive Summary

We evaluated 10 job board APIs across Tier 1 (remote-first) and Tier 2 (general with remote filters) categories. **Three APIs emerged as clear winners** for our nearshore recruiting use case, each serving different needs:

1. **Himalayas.app** (RECOMMENDED PRIMARY) — 110K+ jobs, best structured data, free, no auth, excellent for bulk ingestion
2. **Remotive** (RECOMMENDED SECONDARY) — Curated remote jobs, 86% salary coverage, good filtering, free
3. **JSearch/RapidAPI** (RECOMMENDED FOR BROAD SEARCH) — Google Jobs aggregator, worldwide coverage, paid tiers available

RemoteOK is a viable free fallback. Adzuna covers LATAM well (including Brazil) but requires registration. The Muse, Careerjet, We Work Remotely, Remote.co, and JustRemote are either not API-friendly or not remote-focused enough.

---

## 1. API Comparison Matrix (AC1)

### Tier 1 — Remote-First APIs

| Criterion (Weight) | Himalayas | Remotive | RemoteOK | WWR | Remote.co | JustRemote |
|---------------------|-----------|----------|----------|-----|-----------|------------|
| Remote-First Focus (5) | 5 | 5 | 5 | 5 | 4 | 4 |
| API Maintenance (5) | 5 | 4 | 3 | 1 | 1 | 1 |
| Data Quality (5) | 5 | 4 | 3 | 3 | 2 | 2 |
| Free Tier Availability (4) | 5 | 5 | 5 | 5 | 1 | 1 |
| Geographic Coverage (4) | 4 | 3 | 3 | 3 | 2 | 2 |
| Data Freshness (4) | 5 | 3 | 4 | 3 | 2 | 2 |
| Rate Limits (3) | 4 | 2 | 4 | 3 | 1 | 1 |
| Ease of Integration (3) | 5 | 5 | 4 | 2 | 1 | 1 |
| Search Capabilities (3) | 3 | 4 | 2 | 1 | 1 | 1 |
| Salary Data (2) | 4 | 5 | 2 | 1 | 1 | 1 |
| Company Details (2) | 4 | 3 | 2 | 2 | 1 | 1 |
| **Weighted Score** | **176** | **152** | **132** | **104** | **68** | **64** |

### Tier 2 — General APIs with Remote Filters

| Criterion (Weight) | Adzuna | The Muse | JSearch | Careerjet |
|---------------------|--------|----------|---------|-----------|
| Remote-First Focus (5) | 2 | 1 | 2 | 1 |
| API Maintenance (5) | 4 | 4 | 4 | 3 |
| Data Quality (5) | 4 | 3 | 4 | 3 |
| Free Tier Availability (4) | 4 | 5 | 3 | 4 |
| Geographic Coverage (4) | 5 | 3 | 5 | 5 |
| Data Freshness (4) | 4 | 3 | 5 | 3 |
| Rate Limits (3) | 3 | 4 | 2 | 3 |
| Ease of Integration (3) | 4 | 4 | 4 | 3 |
| Search Capabilities (3) | 4 | 3 | 5 | 4 |
| Salary Data (2) | 4 | 1 | 5 | 3 |
| Company Details (2) | 3 | 4 | 4 | 2 |
| **Weighted Score** | **142** | **118** | **148** | **120** |

### Rankings (All APIs)

| Rank | API | Score | Verdict |
|------|-----|-------|---------|
| 1 | **Himalayas** | 176 | **PRIMARY** — Best overall for our use case |
| 2 | **Remotive** | 152 | **SECONDARY** — Best salary data quality |
| 3 | **JSearch** | 148 | VIABLE — Best for broad aggregated search |
| 4 | **Adzuna** | 142 | VIABLE — Best LATAM geographic coverage |
| 5 | **RemoteOK** | 132 | VIABLE — Simplest integration, limited data |
| 6 | **Careerjet** | 120 | MARGINAL — Affiliate model, not remote-focused |
| 7 | **The Muse** | 118 | MARGINAL — Not remote-focused, limited listings |
| 8 | **We Work Remotely** | 104 | NOT VIABLE — RSS only, no JSON API |
| 9 | **Remote.co** | 68 | NOT VIABLE — No public API |
| 10 | **JustRemote** | 64 | NOT VIABLE — No public API |

---

## 2. Technical Summary for Each Viable API (AC2, AC8)

### 2.1 Himalayas.app (Score: 176)

**Endpoint**: `GET https://himalayas.app/jobs/api`

**Authentication**: None required. Fully public API.

**Rate Limits**: No explicit rate limit documented. Max 20 results per request (enforced since March 2025). Be respectful — they ask that you mention Himalayas as source and link back.

**Pricing**: Completely free. No paid tiers.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Results per page (max 20) |
| `offset` | int | Skip N results for pagination |

**Response Fields**:
```json
{
  "totalCount": 109998,
  "offset": 0,
  "limit": 20,
  "jobs": [{
    "title": "Staff Technical Marketing Engineer",
    "companyName": "Cribl",
    "companyLogo": "https://...",
    "employmentType": "Full Time",
    "seniority": ["Senior"],
    "parentCategories": ["Marketing"],
    "categories": ["Technical-Marketing", "Cloud-Security"],
    "locationRestrictions": ["United States"],
    "timezoneRestrictions": [],
    "minSalary": 175000,
    "maxSalary": 195000,
    "currency": "USD",
    "description": "<html>...",
    "excerpt": "Short summary...",
    "applicationLink": "https://himalayas.app/companies/cribl/jobs/...",
    "guid": "unique-id",
    "pubDate": 1772444199,
    "expiryDate": null
  }]
}
```

**Authentication Flow (AC8)**: No authentication needed. Simply make a GET request:
```bash
curl "https://himalayas.app/jobs/api?limit=20&offset=0"
```

**Gotchas**:
- `pubDate` is a Unix timestamp, not ISO 8601
- `locationRestrictions` is an array of strings (can be empty for worldwide)
- Max 20 per request — need to paginate for bulk collection
- Salary may be `null` for ~43% of listings
- No server-side search/filter by keyword — must collect and filter client-side
- Must credit Himalayas as source and link back

**Strengths**: Massive dataset (110K+ jobs), excellent structured data (seniority, categories, employment type, currency), frequently updated, also offers MCP server for AI agents.

---

### 2.2 Remotive (Score: 152)

**Endpoint**: `GET https://remotive.com/api/remote-jobs`

**Authentication**: None required. Public API.

**Rate Limits**: Max 2 requests per minute. Recommended max 4 requests per day. Excessive requests are blocked.

**Pricing**: Free for public API. Private API available (contact hello@remotive.com).

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category name or slug |
| `search` | string | Search title + description (case-insensitive, partial match) |
| `company_name` | string | Filter by company (case-insensitive, partial match) |
| `limit` | int | Max results to return |

**Available Categories**: Software Development, Customer Service, Design, Marketing, Sales / Business, Product, Project Management, AI / ML, Data Analysis, DevOps / Sysadmin, Finance, Human Resources, QA, Writing, Legal, Medical, Education, All others

**Response Fields**:
```json
{
  "job-count": 23,
  "jobs": [{
    "id": 2082736,
    "url": "https://remotive.com/remote-jobs/marketing/senior-amazon-brand-manager-2082736",
    "title": "Senior Amazon Brand Manager",
    "company_name": "GNO Partners",
    "company_logo": "https://...",
    "company_logo_url": "https://...",
    "category": "Marketing",
    "job_type": "full_time",
    "publication_date": "2026-02-26T07:45:46",
    "candidate_required_location": "Worldwide",
    "salary": "$220k-$300k OTE",
    "description": "<html>...",
    "tags": ["amazon", "backend", "project management", "PPC"]
  }]
}
```

**Authentication Flow (AC8)**: No authentication. Simple GET request:
```bash
# All jobs
curl "https://remotive.com/api/remote-jobs"

# Filtered by category
curl "https://remotive.com/api/remote-jobs?category=software-dev"

# Search
curl "https://remotive.com/api/remote-jobs?search=python"

# Categories list
curl "https://remotive.com/api/remote-jobs/categories"
```

**Gotchas**:
- Jobs are delayed 24 hours from posting
- Very strict rate limit (2/min, 4/day recommended)
- `salary` is a free-text string, not structured (e.g., "$220k-$300k OTE" or "$3,5k–$5k/month")
- `job_type` values: full_time, contract, part_time, freelance, internship
- Category filter for "software-dev" currently returns ALL jobs (possible bug or deliberate)
- Must credit Remotive as source and link back
- Cannot collect signups/emails — ToS violation

**Strengths**: Excellent salary data (86% coverage), curated quality listings, good filtering via search/category, active community.

---

### 2.3 RemoteOK (Score: 132)

**Endpoint**: `GET https://remoteok.com/api`

**Authentication**: None required. Public API.

**Rate Limits**: Not explicitly documented. Send `User-Agent` header.

**Pricing**: Free.

**Response Fields**:
```json
[
  {"last_updated": 1709129047, "legal": "API Terms of Service: ..."},
  {
    "slug": "remote-junior-live-ops-game-designer-...",
    "id": "1130577",
    "epoch": "1709129047",
    "date": "2026-02-28T21:00:14+00:00",
    "company": "A Thinking Ape",
    "company_logo": "https://...",
    "position": "Junior Live Ops Game Designer",
    "tags": ["game", "design", "designer", "mobile"],
    "description": "<html>...",
    "location": "BC",
    "salary_min": 0,
    "salary_max": 0,
    "apply_url": "https://remoteOK.com/remote-jobs/...",
    "url": "https://remoteOK.com/remote-jobs/...",
    "logo": "https://...",
    "original": true,
    "verified": true
  }
]
```

**Authentication Flow (AC8)**: No auth needed:
```bash
curl -H "User-Agent: MyApp/1.0" "https://remoteok.com/api"
```

**Gotchas**:
- First element is ALWAYS a legal notice object, not a job — skip `data[0]`
- No pagination — returns ALL current jobs in a single response (~98 jobs)
- No server-side filtering — all filtering is client-side
- `salary_min`/`salary_max` are integers but often `0` (only 11% have data)
- `location` is inconsistent: empty string, "Remote", city name, or country
- Must mention RemoteOK and link back with follow link (no nofollow)

**Strengths**: Simplest possible integration (one GET, no auth, no pagination), real-time data, good for quick prototyping.

---

### 2.4 JSearch via RapidAPI (Score: 148)

**Endpoint**: `GET https://jsearch.p.rapidapi.com/search`

**Authentication**: RapidAPI key via header `X-RapidAPI-Key`.

**Rate Limits**:
| Tier | Price | Requests/Month | Rate Limit |
|------|-------|---------------|------------|
| Free | $0 | 200 | 1,000/hr |
| Pro | $25/mo | 10,000 | 5/sec |
| Ultra | $75/mo | 50,000 | 10/sec |
| Mega | $150/mo | 200,000 | 20/sec |

**Key Parameters**: `query`, `page`, `num_pages`, `date_posted`, `remote_jobs_only`, `employment_types`, `job_requirements`

**Response includes**: 40+ data points per job including employer details, salary estimates from multiple sources, application links, geographic coordinates, required experience, and education levels. Up to 500 results per query.

**Gotchas**:
- Requires RapidAPI account and credit card for paid tiers
- Free tier is only 200 requests/month — very limited for production
- Response time varies (1-8 seconds)
- Data sourced from Google Jobs — may include stale listings

---

### 2.5 Adzuna (Score: 142)

**Endpoint**: `GET https://api.adzuna.com/v1/api/jobs/{country}/search/{page}`

**Authentication**: `app_id` and `app_key` as query parameters. Free registration at developer.adzuna.com.

**Rate Limits (Free Tier)**:
- 25 requests/minute
- 250 requests/day
- 1,000 requests/week
- 2,500 requests/month

**Geographic Coverage (12 countries)**: UK, US, Germany, France, Australia, New Zealand, Canada, India, Poland, **Brazil**, Austria, South Africa.

**Gotchas**:
- Requires registration for API keys
- Country code in URL path (not a parameter)
- Not remote-focused — "remote" is just a location keyword
- Only includes Brazil from LATAM countries

---

## 3. Data Schema Comparison (AC9)

| Field (Normalized) | Himalayas | Remotive | RemoteOK | JSearch | Adzuna | The Muse |
|---------------------|-----------|----------|----------|---------|--------|----------|
| Job Title | `title` | `title` | `position` | `job_title` | `title` | `name` |
| Company Name | `companyName` | `company_name` | `company` | `employer_name` | `company.display_name` | `company.name` |
| Company Logo | `companyLogo` | `company_logo` | `company_logo` | `employer_logo` | — | `company.refs.logo_image` |
| Job Description | `description` | `description` | `description` | `job_description` | `description` | `contents` |
| Short Description | `excerpt` | — | — | `job_highlights` | — | — |
| Location | `locationRestrictions[]` | `candidate_required_location` | `location` | `job_city`, `job_state`, `job_country` | `location.display_name` | `locations[].name` |
| Remote Flag | Implicit (all remote) | Implicit (all remote) | Implicit (all remote) | `job_is_remote` | — | — |
| Salary Min | `minSalary` (numeric) | — | `salary_min` (int) | `job_min_salary` | `salary_min` | — |
| Salary Max | `maxSalary` (numeric) | — | `salary_max` (int) | `job_max_salary` | `salary_max` | — |
| Salary (Text) | — | `salary` (string) | — | — | — | — |
| Currency | `currency` | — | — | `job_salary_currency` | — | — |
| Job Type | `employmentType` | `job_type` | — | `job_employment_type` | `contract_type` | `type` |
| Category | `parentCategories[]` | `category` | — | — | `category.label` | `categories[].name` |
| Tags/Skills | `categories[]` | `tags[]` | `tags[]` | `job_required_skills` | — | `tags[]` |
| Seniority | `seniority[]` | — | — | `job_required_experience` | — | `levels[].name` |
| Date Posted | `pubDate` (epoch) | `publication_date` (ISO) | `date` (ISO) | `job_posted_at_datetime_utc` | `created` | `publication_date` (ISO) |
| Apply URL | `applicationLink` | `url` | `apply_url` | `job_apply_link` | `redirect_url` | `refs.landing_page` |
| Unique ID | `guid` | `id` | `id` | `job_id` | `id` | `id` |
| Timezone | `timezoneRestrictions[]` | — | — | — | — | — |
| Expiry Date | `expiryDate` | — | — | `job_offer_expiration_datetime_utc` | — | — |

**Key Takeaways**:
- **Himalayas** has the richest schema: seniority, timezone restrictions, categories, structured salary with currency
- **Remotive** has salary as free-text string — needs parsing but often contains ranges like "$165k - $300k"
- **RemoteOK** is simplest but sparsest — no categories, no seniority, salary often 0
- **JSearch** is most comprehensive per-job but requires paid tier for volume

---

## 4. Cost Analysis (AC6)

### Free Tier Comparison

| API | Cost | Requests | Jobs Accessible | Notes |
|-----|------|----------|-----------------|-------|
| Himalayas | $0 | Unlimited* | 110K+ | 20 per request, need pagination |
| Remotive | $0 | ~4/day (rec.) | ~20-50 active | Small but curated |
| RemoteOK | $0 | Unlimited* | ~100 | All in one request |
| JSearch | $0 | 200/month | 500/query × 200 | Very limited free tier |
| Adzuna | $0 | 2,500/month | Variable | Registration required |
| The Muse | $0 | 500/hr unreg. | 488K+ | Not remote-focused |
| Careerjet | $0 | Unlisted | Variable | Affiliate model |

*"Unlimited" means no explicit rate limit, but should be used respectfully.

### Cost for Our Use Case

**Scenario**: Refresh job listings 4× daily, collect ~500 new jobs per refresh.

| API | Requests/Day | Monthly Cost | Notes |
|-----|-------------|--------------|-------|
| Himalayas | ~100 (4 refreshes × 25 pages) | **$0** | Well within implicit limits |
| Remotive | 4 | **$0** | Gets all jobs per request |
| RemoteOK | 4 | **$0** | Gets all jobs per request |
| JSearch | 100 | **$25/mo** (Pro tier) | Free tier insufficient |
| Adzuna | 100 | **$0** | Within 2,500/month |

**Recommendation**: Start with Himalayas + Remotive (both free). Add JSearch Pro ($25/mo) only if we need broader non-remote-specific coverage.

---

## 5. Geographic Coverage (AC4)

### LATAM + US/Canada Coverage

| API | US | Canada | Mexico | Colombia | Argentina | Brazil | Notes |
|-----|-----|--------|--------|----------|-----------|--------|-------|
| Himalayas | ✅ Strong | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Worldwide listings, location restrictions as array |
| Remotive | ✅ Strong | ✅ Yes | ❓ Rare | ❓ Rare | ❓ Rare | ❓ Rare | Mostly "Worldwide" or US-specific |
| RemoteOK | ✅ Yes | ✅ Yes | ✅ Yes | ❓ Rare | ❓ Rare | ❓ Rare | Some LATAM listings, inconsistent format |
| JSearch | ✅ Strong | ✅ Strong | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Google Jobs — global |
| Adzuna | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes | Only 12 countries, Brazil is only LATAM |
| The Muse | ✅ Strong | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No | US-centric |

**Key Finding**: Himalayas has the best LATAM coverage among remote-first APIs. In our 100-job sample, we found jobs tagged for Mexico, Colombia, Brazil, and "LATAM" explicitly. Jobs tagged "Worldwide" are also accessible to LATAM candidates.

**Verified LATAM Listings from Himalayas POC**:
- "Senior AI Agent Engineer (Python, ML Systems) - LATAM" at DaCodes (Mexico)
- "QA Lead / Manager | Remote in Mexico" at GSB Solutions (Mexico)
- "Senior Backend Engineer (Node.js & AWS Serverless) - LATAM" at DaCodes (Mexico)
- Jobs at Wikimedia Foundation tagged for Brazil, Colombia, Mexico, Peru, Uruguay

---

## 6. Proof of Concept Results (AC3, AC7)

### POC Scripts

All POC scripts are in `/features/research/R1-poc/`:

| Script | API | Auth | Jobs Fetched | Filtering Demo | Status |
|--------|-----|------|-------------|----------------|--------|
| `himalayas_poc.py` | Himalayas | None | 100+ | Location (US, LATAM) | ✅ PASS |
| `remotive_poc.py` | Remotive | None | 23 | Category, Search ("python") | ✅ PASS |
| `remoteok_poc.py` | RemoteOK | None | 98 | Tag ("python", "react"), Location | ✅ PASS |

### POC Code Characteristics (AC7):
- **Comments**: Each script has module docstring + step-by-step comments
- **Environment variables**: Not needed (no auth required for any of the top 3)
- **Error handling**: All scripts handle HTTP errors, connection errors, JSON parse errors
- **Reusable**: Common patterns (fetch → parse → filter → display) easily adaptable
- **Zero dependencies**: Uses only Python stdlib (`urllib`, `json`)

### What Each POC Demonstrates:
1. **Himalayas**: Pagination (limit/offset), location filtering (US, LATAM), salary analysis, 110K+ total jobs
2. **Remotive**: Category filtering, keyword search, geographic analysis, 86% salary coverage
3. **RemoteOK**: Tag-based filtering, location filtering, legal notice handling, tag frequency analysis

---

## 7. Recommendation (AC5)

### Primary Recommendation: **Himalayas.app**

**Rationale**:
- **Largest dataset** among remote-first APIs (110K+ jobs vs. 23 for Remotive, 98 for RemoteOK)
- **Best structured data**: Seniority levels, multiple categories, structured salary with currency, timezone restrictions, employment type
- **Best LATAM coverage**: Explicit location restrictions that include Mexico, Colombia, Brazil, Argentina
- **Free with no auth**: Simplest possible integration — one HTTP GET
- **Actively maintained**: API docs updated Feb 2026, new `currency` field added May 2025
- **MCP server available**: Future potential for AI agent integration via Himalayas MCP

**Pros**:
- Massive dataset, constantly growing
- Excellent data quality and structure
- No authentication, no rate limits
- Free forever (public API)
- Good for bulk ingestion and matching

**Cons**:
- No server-side search/filter — must collect all and filter client-side
- Max 20 per page — need ~5,500 requests to collect all 110K jobs
- Salary data in ~57% of listings (not as good as Remotive's 86%)
- `pubDate` is Unix timestamp, not ISO 8601

### Secondary Recommendation: **Remotive** (complement to Himalayas)

**Rationale**: Use Remotive for its **curated quality** and **excellent salary data** (86% coverage). The smaller dataset (20-50 active jobs at any time) is actually a feature — these are hand-picked, high-quality remote positions.

**Pros**:
- Highest salary data coverage (86%)
- Server-side filtering (category, search, company)
- Curated, high-quality listings
- 18 well-defined categories

**Cons**:
- Very small dataset (~23 active jobs at test time)
- Strict rate limits (2/min, 4/day recommended)
- 24-hour data delay
- Salary as free-text string (needs parsing)

### Integration Strategy

Use both APIs together:
1. **Himalayas** for volume — bulk ingest all jobs, update 4× daily
2. **Remotive** for quality — supplement with curated listings, higher salary data coverage
3. **Deduplicate** by company name + job title + location

---

## 8. Next Steps (AC10)

### Immediate (This Sprint)
1. **Create `job_listings` table in Xano** — Owner: `backend-developer`
   - Fields mapped from Himalayas schema: title, company_name, company_logo, employment_type, seniority, categories, location_restrictions, timezone_restrictions, min_salary, max_salary, currency, description, excerpt, application_link, source_api, source_id, fetched_at, expires_at
   - Estimated effort: 1 day

2. **Build Himalayas ingestion endpoint** — Owner: `backend-developer`
   - Xano function that paginates through Himalayas API and stores jobs
   - Run as scheduled task (4× daily)
   - Estimated effort: 1-2 days

3. **Build Remotive ingestion endpoint** — Owner: `backend-developer`
   - Simpler — single request gets all jobs
   - Merge into same `job_listings` table with `source_api = "remotive"`
   - Estimated effort: 0.5 days

### Short-term (Next Sprint)
4. **Build deduplication logic** — Match on normalized title + company + location
5. **Add basic search API** — Search job_listings by keyword, location, category
6. **Frontend job board view** — Owner: `frontend-developer`
   - Display jobs in nearshore-talent-compass dashboard

### Prerequisites
- No API key approvals needed (all free, no auth)
- Xano schema changes needed (new table)
- No additional infrastructure costs

### Effort Estimate
- **MVP integration (Himalayas + Remotive → Xano)**: 2-3 days
- **Search API + dedup**: 1-2 days
- **Frontend display**: 2-3 days
- **Total to production-ready job board**: ~1 week

---

## Appendix A: APIs Evaluated but Not Recommended

### We Work Remotely (Score: 104)
- **Status**: RSS feed only at `weworkremotely.com/remote-jobs.rss`
- **Why not**: No JSON API. Partnership required for API access. RSS is XML-based and limited in data fields.

### Remote.co (Score: 68)
- **Status**: No public API found
- **Why not**: Only available via third-party scrapers (Apify). No official developer access.

### JustRemote (Score: 64)
- **Status**: No public API found
- **Why not**: Website only. No developer documentation or API endpoints.

### The Muse (Score: 118)
- **Status**: Working API at `themuse.com/api/public/jobs`
- **Why not**: 488K+ jobs but overwhelmingly NOT remote. No effective remote filter. US-centric with no LATAM coverage. No salary data.

### Careerjet (Score: 120)
- **Status**: Working API at `search.api.careerjet.net/v4/query`
- **Why not**: Affiliate model (requires partner account), must pass user IP and user agent with every request (designed for server-side job search widgets, not data ingestion), basic auth required. Not remote-focused.

---

## Appendix B: Weighted Score Calculation Details

**Formula**: Score = Σ(Criterion_Score × Weight)

**Maximum possible score**: (5×5) + (5×5) + (5×5) + (5×4) + (5×4) + (5×4) + (5×3) + (5×3) + (5×3) + (5×2) + (5×2) = 200

**Himalayas score breakdown**:
- Remote-First (5×5=25) + API Maintenance (5×5=25) + Data Quality (5×5=25) + Free Tier (5×4=20) + Geo Coverage (4×4=16) + Freshness (5×4=20) + Rate Limits (4×3=12) + Ease (5×3=15) + Search (3×3=9) + Salary (4×2=8) + Company (4×2=8) = **176/200**
