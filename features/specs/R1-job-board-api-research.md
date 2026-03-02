# R1: Job Board API Research

**Priority**: Medium
**Type**: RESEARCH
**Project**: Multi-project (backend + potential integrations)
**Status**: pending

## Problem

We need to understand which public job board APIs are available and suitable for programmatically finding open positions. This research will inform future automation features like:
- Auto-discovering relevant job openings for our talent pool
- Matching candidates to positions based on skills/experience
- Tracking job market trends in nearshore recruiting
- Automating job application processes

Currently, we lack a clear picture of:
- Which APIs are available (LinkedIn, Indeed, GitHub Jobs, etc.)
- What their capabilities, limitations, and pricing models are
- How they authenticate and what data they return
- Which would be best for our use case

## Solution

Conduct comprehensive research on public job board APIs to create a decision matrix and technical integration guide.

### Research Scope

1. **API Discovery**: Identify all major public job board APIs
2. **Capability Analysis**: What data can each API provide?
3. **Access Requirements**: Authentication, rate limits, pricing
4. **Data Quality**: How structured is the data? How current?
5. **Integration Complexity**: Ease of integration with our stack
6. **Recommendation**: Which API(s) should we prioritize?

### Deliverables

1. **Comparison Matrix**: Spreadsheet or markdown table comparing APIs across key dimensions
2. **Technical Summary**: For each viable API, document:
   - Authentication method
   - Rate limits
   - Pricing tiers (free tier availability)
   - Sample request/response
   - Data fields available (job title, location, salary, description, etc.)
   - Geographic coverage
   - Update frequency
3. **Proof of Concept**: For top 1-2 candidates, create a working example that:
   - Authenticates successfully
   - Fetches a sample of job listings
   - Parses the response
   - Demonstrates filtering (by location, job type, etc.)
4. **Recommendation Report**: Final verdict on which API(s) to use and why

## APIs to Evaluate

**FOCUS**: Remote-first job boards with well-maintained APIs. Avoid traditional aggregators (LinkedIn, Indeed, Glassdoor) that either lack public APIs or have restrictive access.

### Tier 1 (High Priority - Remote-First APIs)
- **RemoteOK API** — De facto remote job board, simple REST API
- **We Work Remotely API** — Established remote job platform, check API availability
- **Remotive API** — Remote jobs focused, check API status
- **Remote.co API** — Remote-specific board, verify API access
- **Himalayas API** — Growing remote jobs platform (remoteok competitor)
- **JustRemote API** — Remote jobs aggregator, verify API availability

### Tier 2 (Medium Priority - General APIs with Good Remote Filters)
- **Adzuna API** — Known for good free tier, has remote filters
- **The Muse API** — Good data quality, remote filtering
- **Careerjet API** — Aggregator with remote support
- **JSearch API** (RapidAPI) — Meta-search across boards, has remote flags

### Tier 3 (Low Priority - Niche/Specialized)
- **AngelList/Wellfound API** — Startup jobs, often remote-friendly
- **Hacker News "Who's Hiring" threads** — Monthly posts, scrapeable but no formal API
- **Dev.to Jobs API** — Tech-focused, check availability
- **RemoteLeaf API** — Newer remote-first board, verify maturity

### Explicitly OUT OF SCOPE
- ❌ **LinkedIn Jobs API** — Not publicly available, requires partnership
- ❌ **Indeed API** — Deprecated or heavily restricted
- ❌ **Glassdoor API** — No public API
- ❌ **ZipRecruiter API** — Not publicly available
- ❌ **GitHub Jobs** — Sunset in 2021
- ❌ **Stack Overflow Jobs** — Sunset in 2022

## Evaluation Criteria

For each API, score on a 1-5 scale:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Remote-First Focus** | 5 | Is this a remote-native platform, not just a filter? |
| **API Maintenance** | 5 | Is API actively maintained? Recent updates? Good docs? |
| **Data Quality** | 5 | How complete and accurate are job listings? |
| **Free Tier Availability** | 4 | Can we test/prototype without cost? |
| **Geographic Coverage** | 4 | Does it cover LATAM + US markets? |
| **Data Freshness** | 4 | How often are listings updated? |
| **Rate Limits** | 3 | Are limits reasonable for our use case? |
| **Ease of Integration** | 3 | RESTful? Good docs? SDKs available? |
| **Search Capabilities** | 3 | Can we filter by skills, location, experience? |
| **Salary Data** | 2 | Is compensation info included? |
| **Company Details** | 2 | Does it include company name, size, industry? |

**Weighted Score** = Sum of (Score × Weight)

## Research Process

### Phase 1: Discovery & Documentation (2-3 hours)
1. Search for each API's official documentation
2. Check API status (active, deprecated, sunset)
3. Document authentication requirements
4. Note pricing and rate limits
5. Review sample responses and data schemas
6. Fill out comparison matrix

### Phase 2: Hands-On Testing (2-3 hours)
1. Select top 3 APIs based on Phase 1 findings
2. Register for API keys
3. Write simple test scripts (Python or curl) to:
   - Authenticate
   - Fetch sample job listings
   - Parse response
   - Test filtering capabilities
4. Document actual experience vs. documented claims
5. Note any gotchas or undocumented limitations

### Phase 3: Analysis & Recommendation (1 hour)
1. Compare actual test results against evaluation criteria
2. Calculate weighted scores
3. Write recommendation report with pros/cons
4. Suggest integration approach for top choice(s)
5. Identify any blockers or concerns

## Expected Findings

We expect to discover that:
- **Remote-first platforms have better APIs** than traditional aggregators (RemoteOK, WWR likely to have accessible APIs)
- **API quality varies**: Some platforms have robust, well-documented APIs; others may only offer RSS/scraping-based access
- **Free tiers are common**: Remote job boards often have generous free access for developers
- **LATAM coverage is inconsistent**: US/Europe-focused boards may have limited Latin American listings
- **Authentication is typically simple**: API key-based or minimal OAuth flows (remote-first platforms tend to be developer-friendly)
- **Data freshness is critical**: Remote jobs move fast; API update frequency matters
- **Some platforms may not have formal APIs**: May need to evaluate scraping as fallback (with permission/ToS review)

## Integration Considerations

Once we choose an API, consider:
1. **Storage**: Store job listings in Xano (new `job_listings` table?)
2. **Matching**: How to match jobs to candidates (skills, location, experience level)
3. **Deduplication**: Same job may appear in multiple APIs — how to handle?
4. **Refresh Strategy**: How often to poll for new listings?
5. **Cost Management**: Stay within free tier limits or budget for paid tier?

## Acceptance Criteria

### AC1: API Comparison Matrix Completed
**Given** the research is complete
**When** reviewing the deliverables
**Then** a comparison matrix exists with all Tier 1 APIs evaluated
**And** each API has scores for all evaluation criteria
**And** the matrix is in markdown or CSV format

### AC2: Documentation for Each Viable API
**Given** an API is marked as "viable" in the matrix
**When** reviewing the technical summary
**Then** it includes authentication method, rate limits, pricing, sample request/response, and data fields
**And** all information is accurate and up-to-date (verified as of research date)

### AC3: Working Proof of Concept for Top API
**Given** the top-ranked API is identified
**When** running the POC script
**Then** it successfully authenticates
**And** fetches at least 10 sample job listings
**And** parses and displays key fields (title, company, location, description)
**And** demonstrates at least one filter (e.g., location = "Remote" or country = "United States")

### AC4: Geographic Coverage Verified
**Given** each Tier 1 API
**When** reviewing the documentation and test results
**Then** we know whether it covers LATAM markets (specifically: Mexico, Colombia, Argentina, Brazil)
**And** we know whether it covers US and Canada
**And** this is documented in the comparison matrix

### AC5: Recommendation Report Written
**Given** all research is complete
**When** reading the recommendation report
**Then** it clearly identifies the top 1-2 APIs to use
**And** provides a rationale based on evaluation criteria
**And** lists pros and cons of the recommendation
**And** flags any blockers or concerns (e.g., cost, rate limits, data quality)
**And** suggests next steps for integration

### AC6: Cost Analysis Included
**Given** each API has a pricing model
**When** reviewing the research
**Then** the cost of a free tier is documented (requests/month, features)
**And** the cost of the first paid tier is documented
**And** an estimate is provided for our use case (e.g., "500 API calls/day would cost $X/month")

### AC7: POC Code is Reusable
**Given** the POC script exists
**When** another developer reviews it
**Then** it has clear comments explaining each step
**And** it uses environment variables for API keys (not hardcoded)
**And** it handles errors gracefully (invalid API key, rate limit exceeded, etc.)
**And** it can be easily adapted to other APIs with minimal changes

### AC8: Authentication Flow Documented
**Given** the top-ranked API requires authentication
**When** reviewing the technical summary
**Then** the exact authentication flow is documented step-by-step
**And** sample code or curl commands are provided
**And** any gotchas are noted (e.g., "access token expires after 1 hour", "must pass client_id in header, not query param")

### AC9: Data Schema Comparison
**Given** multiple APIs return job listing data
**When** comparing their response schemas
**Then** a table exists showing which fields each API provides
**And** field names are normalized (e.g., all APIs' "job title" field listed even if named differently)
**And** we can see at a glance which APIs provide salary data, remote flag, required skills, etc.

### AC10: Next Steps Defined
**Given** the recommendation is complete
**When** the report concludes
**Then** it includes a "Next Steps" section
**And** suggests which team member should own integration (backend-developer)
**And** estimates effort (e.g., "2-3 days to build MVP integration")
**And** lists prerequisites (API key approval, Xano schema changes, etc.)

## Implementation Plan

### Phase 1: Discovery
- [ ] Research and document all Tier 1 remote-first APIs
- [ ] Check API status (active/maintained/deprecated)
- [ ] Verify platform is actively maintained (recent job postings, API docs updated)
- [ ] Document authentication, rate limits, pricing
- [ ] Check for "remote" as native filter vs. just a location flag
- [ ] Fill out comparison matrix

### Phase 2: Hands-On Testing
- [ ] Register for API keys (top 3 APIs)
- [ ] Write test scripts for each
- [ ] Verify geographic coverage claims
- [ ] Test filtering capabilities
- [ ] Document actual vs. documented experience

### Phase 3: Analysis
- [ ] Calculate weighted scores
- [ ] Rank APIs by score
- [ ] Write recommendation report
- [ ] Create data schema comparison table
- [ ] Define next steps for integration

### Phase 4: Delivery
- [ ] Create `features/research/R1-job-board-api-research.md` with full findings
- [ ] Include comparison matrix (markdown table or CSV)
- [ ] Include POC code samples
- [ ] Include recommendation report
- [ ] Present findings to Pablo for decision

## Dependencies

None. This is a pure research task with no code dependencies.

## Artifacts Location

All research artifacts should be stored in:
- **Report**: `features/research/R1-job-board-api-research.md`
- **POC Code**: `features/research/R1-poc/` (Python scripts or curl examples)
- **Comparison Matrix**: Embedded in report or `features/research/R1-comparison-matrix.csv`

## Testing Plan

No automated testing required (research task). Validation is manual:
1. Review comparison matrix for completeness
2. Run POC scripts to verify they work
3. Cross-check claims against official API documentation

## Success Metrics

- ✅ All Tier 1 APIs evaluated
- ✅ At least 1 working POC demonstrating job listing retrieval
- ✅ Clear recommendation with rationale
- ✅ Cost analysis shows path to staying within budget (or justifies cost)
- ✅ Next steps are actionable (team member assigned, effort estimated)

## Related Tasks

- **Future: Job Matching Agent** (not yet spec'd) — will use this research to match candidates to open positions
- **Future: Auto-Apply Agent** (not yet spec'd) — could use job board data to identify application opportunities

## Notes

This is a **research-only** task. No production code will be written. The goal is to inform future feature development.

Researcher should prioritize:
1. **Speed**: We want findings quickly, not perfection. 1-2 days max.
2. **Practicality**: Focus on APIs we can actually use (free tier or reasonable cost).
3. **Clarity**: Make the recommendation clear and actionable. Pablo should be able to say "yes, build with API X" after reading the report.

If an API requires lengthy approval process (e.g., LinkedIn Partner API needs application review), note this as a blocker and move to next option.
