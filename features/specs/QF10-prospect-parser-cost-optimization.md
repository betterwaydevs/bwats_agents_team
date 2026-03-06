# QF10: Prospect Parser — Local Codex Processing (Zero API Cost)

**Priority**: Medium
**Type**: BACK + INFRA
**Projects**: bwats_xano, new parser server

## Problem

The "Add Prospect" flow uses OpenAI (`call_open_ia` → `gpt-4.1-mini` via `/v1/responses`) to parse HTML profiles and resumes. This burns API tokens on every prospect addition. We want to **eliminate this cost entirely** by moving parsing to a local server that uses Codex (the same model we use in chat).

## Solution Summary

**Move parsing from OpenAI API ($$) to local Codex (free)**:

1. **Extension** continues to call `Add_prospect` on Xano (no changes)
2. **Xano** saves prospect with `parsing_status: "pending"` (no parsing yet)
3. **New Local Parser Server** (Python daemon running 24/7):
   - Polls Xano every 30-60s for pending prospects
   - Calls **local Codex** (same as chat uses) to parse HTML
   - Saves structured data back to Xano
4. **Result**: Zero OpenAI API cost, same parsing quality, async processing

## Current Flow (OpenAI Token-Based)

1. Extension adds a prospect (LinkedIn profile HTML, resume, etc.) → calls Xano `Add_prospect`
2. Xano backend calls `call_open_ia` (function #8365) with the HTML + parser prompt
3. `call_open_ia` sends to OpenAI `gpt-4.1-mini` via Responses API ($$$)
4. OpenAI returns structured data (name, skills, experience, etc.)
5. Data is saved to `parsed_prospect`

### Current Cost Driver
- Model: `gpt-4.1-mini`
- Endpoint: `https://api.openai.com/v1/responses`
- Used by: `get_open_api_parser_prompt` base prompt + per-request prompt
- File uploads supported via `openai_file_id`

## New Architecture (Local Codex — Zero API Cost)

### High-Level Flow

1. **Extension** → calls `Add_prospect` on Xano (same as now)
2. **Xano** → saves prospect with `parsing_status: "pending"`, returns success immediately
3. **Local Parser Server** (always-on, on your network):
   - Polls Xano for prospects with `parsing_status: "pending"`
   - Fetches prospect HTML/resume data
   - Calls **local Codex API** (same model as chat interface) to parse
   - Saves structured data back to Xano `parsed_prospect`
   - Updates `parsing_status: "completed"`

### Why This Architecture?

- **Extension runs on network with server access** → can reach local parser server
- **Codex is already running locally** → zero API token cost
- **Async processing** → Add_prospect returns fast, parsing happens in background
- **Same quality** → uses the exact same model we use for chat parsing
- **Scalable** → can process queue at any rate, batching possible

## Architecture Components

### 1. Local Parser Server (NEW)
- **Language**: Python (recommended) — simpler Codex integration, better async support
- **Location**: Always-on server on your network (same network as extension runs on)
- **Codex Access**: Direct programmatic access to local Codex instance (same as chat interface uses)
- **Responsibilities**:
  - Poll Xano for `parsing_status: "pending"` prospects (every 30-60s)
  - Call local Codex with HTML + parsing prompt
  - Parse Codex response into structured data
  - Save results back to Xano via `save_parsed_prospect` API
  - Handle retries/errors (mark as `"failed"` after 3 attempts)
  - Log all operations for debugging

### 2. Xano Changes (MODIFIED)
- **Add_prospect endpoint**: Remove `call_open_ia` — just save prospect with `parsing_status: "pending"`
- **New API endpoint**: `get_pending_prospects` — returns list of prospects waiting for parsing
- **New API endpoint**: `save_parsed_prospect` — receives structured data from parser server

### 3. Codex Integration (NEW)
- **Model**: Same Codex instance used by chat interface — already running locally
- **Access Method**: Programmatic API calls from Python server to Codex
- **Prompt**: Reuse existing `get_open_api_parser_prompt` logic (same prompts as current OpenAI flow)
- **Response Format**: Structured JSON output (name, skills, experience, etc.) — same schema as current flow

## Decision: Codex (Local) — Zero API Cost

**Why Codex over Claude/OpenAI?**
- Already running locally for chat — no new infrastructure
- Zero API token cost (the whole point of this task)
- Same parsing quality we're already getting
- Can scale processing without worrying about API rate limits

## Implementation Tasks

### Phase 1: Xano Backend Changes
1. **Modify `Add_prospect` endpoint**: Remove `call_open_ia` call — just save prospect with `parsing_status: "pending"`
2. **Create `get_pending_prospects` API**: Returns list of prospects with `parsing_status: "pending"` (with pagination)
3. **Create `save_parsed_prospect` API**: Accepts structured data from parser server and updates `parsed_prospect` + `parsing_status: "completed"`
4. **Add retry logic**: Track `parsing_attempts` — mark as `"failed"` after 3 tries

### Phase 2: Local Parser Server (New Project)
1. **Choose language/framework**: Python (recommended) — simpler Codex client, better async
2. **Project setup**:
   - New directory: `/home/pablo/projects/bwats/prospect_parser_server/` (or similar)
   - Dependencies: `requests` (Xano API), Codex Python client (TBD), `python-dotenv`
   - Config: `.env` file with Xano API base URL, auth token, Codex endpoint
3. **Create server scaffold**: Always-on daemon process (infinite loop with sleep)
4. **Polling loop**:
   - Every 30-60 seconds, call Xano `get_pending_prospects`
   - Process one prospect at a time (can parallelize later)
5. **Codex integration**:
   - Connect to local Codex instance (same as chat uses)
   - Use existing `get_open_api_parser_prompt` logic as prompt template
   - Send HTML + prompt to Codex
   - Parse response JSON
6. **Result processing**:
   - Extract structured data from Codex response
   - Call Xano `save_parsed_prospect` with parsed data
   - Update `parsing_status: "completed"`
7. **Error handling**:
   - Catch exceptions from Codex API or Xano API
   - Log all errors with timestamps
   - Increment `parsing_attempts` on failure
   - Mark as `"failed"` after 3 attempts (don't retry forever)

### Phase 3: Codex Integration Details (Investigate First)
Before building the parser server, we need to determine:
1. **How to call Codex programmatically**:
   - Is there an HTTP API? gRPC? Direct SDK?
   - What's the endpoint URL/port?
   - Authentication method (if any)?
2. **Test Codex parsing**:
   - Send a sample LinkedIn profile HTML + parsing prompt
   - Verify response format matches current OpenAI output
   - Measure latency (should be fast since local)
3. **Document Codex interface**:
   - Create `prospect_parser_server/CODEX_API.md` with:
     - Example request/response
     - Authentication setup
     - Error handling patterns

### Phase 4: Deployment & Testing
1. **Deploy parser server**:
   - Set up as systemd service on network server
   - Configure `.env` with Xano API URL, auth token, Codex endpoint
   - Start service and verify it's polling Xano
2. **Test end-to-end**:
   - Add prospect via extension → verify Xano saves with `parsing_status: "pending"`
   - Verify parser picks it up within 60 seconds
   - Verify Codex parsing completes and data is saved back to Xano
   - Check data quality matches current OpenAI flow (test on 10+ real profiles)
3. **Monitor**:
   - Track parsing success rate, latency, failure cases
   - Set up alerts for parsing failures or server crashes
4. **Gradual rollout**:
   - Start with dev branch (test with dev Xano database)
   - Once stable, deploy to production (v1 branch)

## Acceptance Criteria

- [ ] AC1: Extension adds prospect → Xano saves with `parsing_status: "pending"` → returns success immediately (< 2s)
- [ ] AC2: Parser server picks up pending prospects within 60 seconds
- [ ] AC3: Codex parsing produces same quality data as current OpenAI flow (test on 10+ real profiles)
- [ ] AC4: Parsed data is saved back to Xano and `parsing_status: "completed"`
- [ ] AC5: Failed parses are marked `"failed"` after 3 attempts (don't retry forever)
- [ ] AC6: Zero OpenAI API token usage for prospect parsing (cost = $0)
- [ ] AC7: Parser server runs 24/7 and auto-restarts on crash (systemd or equivalent)

## Technical Decisions Needed

1. **Codex API details**:
   - ✅ **Codex is already running locally** — same instance used for chat interface
   - Need: API endpoint URL/port for programmatic access
   - Need: Authentication method (if any)
   - Need: Request format (HTTP? SDK? Direct model invocation?)

2. **Parser server language**:
   - **Recommendation**: Python — easier integration with Codex, simpler async processing
   - Alternative: Node.js if Codex client is available

3. **Polling frequency**:
   - **Start with 30-60 seconds** — low enough latency for UX, high enough to avoid hammering Xano
   - Can be configurable via environment variable

4. **Concurrency**:
   - **Start with 1 at a time** — simple, no race conditions
   - Can add parallel processing later if queue backs up

5. **Deployment location**:
   - Server on your network with:
     - Access to Codex instance
     - Access to Xano API (internet or internal network)
     - 24/7 uptime (systemd service)
   - Need: IP/hostname for deployment

## References

- `call_open_ia`: `bwats_xano/functions/8365_call_open_ia.xs` (will be removed/replaced)
- `get_open_api_parser_prompt`: base prompt function (reuse for Codex)
- Current scheduled task: `process_pending_prospects` (task ID 575/576) — similar polling pattern
- Extension integration: `Add_prospect` endpoint is already called by `bw_cold_recruiting` extension
