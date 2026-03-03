# QF10: Prospect Parser — Replace OpenAI with Cheaper Alternative

**Priority**: Medium
**Type**: BACK
**Projects**: bwats_xano

## Problem

The "Add Prospect" flow uses OpenAI (`call_open_ia` → `gpt-4.1-mini` via `/v1/responses`) to parse HTML profiles and resumes. This burns API tokens on every prospect addition. We want to reduce or eliminate this cost.

## Current Flow

1. User adds a prospect (LinkedIn profile HTML, resume, etc.)
2. Backend calls `call_open_ia` (function #8365) with the HTML + a parser prompt
3. `call_open_ia` sends to OpenAI `gpt-4.1-mini` via Responses API
4. OpenAI returns structured data (name, skills, experience, etc.)
5. Data is saved to `parsed_prospect`

### Current Cost Driver
- Model: `gpt-4.1-mini`
- Endpoint: `https://api.openai.com/v1/responses`
- Used by: `get_open_api_parser_prompt` base prompt + per-request prompt
- File uploads supported via `openai_file_id`

## Options

### Option A: Claude API (via Anthropic)
- Already integrated for M11 (Dashboard AI Assistant) — the pattern exists
- Claude Haiku is very cheap for parsing tasks
- Can process HTML directly without file upload
- Benefits: single provider (already paying for Claude), proven HTML parsing quality
- Implementation: create `call_claude_parser` function, or modify `call_open_ia` to support Claude as a provider

### Option B: OpenAI Codex
- Stays on OpenAI infrastructure (minimal code changes)
- Codex models are cheaper than GPT-4.1
- Worth testing if parsing quality holds up
- Implementation: change model name in `call_open_ia`

### Option C: Claude Code Skills (Local Processing)
- Use Claude Code itself (the CLI tool) to process HTML — zero API cost
- Already running for the dashboard assistant
- Limitation: only works when Claude Code is active, not for real-time API calls
- Best for batch processing, not individual prospect additions

## Recommendation

**Option A (Claude API)** — we already have the integration pattern from M11, Haiku is very cheap for structured parsing, and it handles HTML well. Codex is worth a quick test but Claude is the safer bet.

## Tasks

1. Research: Check M11's Claude API integration pattern (how auth token is passed, which model)
2. Create `call_claude_parser` function (or make `call_open_ia` provider-agnostic)
3. Update the prospect parser prompt to work with Claude
4. Test: Parse 5-10 real prospects with both providers, compare quality
5. Switch over and monitor

## Acceptance Criteria

- [ ] AC1: Prospect parsing works with the new provider (same data quality)
- [ ] AC2: Cost per parse is measurably lower than current gpt-4.1-mini
- [ ] AC3: Response time is acceptable (< 15 seconds per parse)
- [ ] AC4: Fallback to OpenAI if new provider fails (graceful degradation)
- [ ] AC5: File/resume upload still works if applicable

## References

- `call_open_ia`: `bwats_xano/functions/8365_call_open_ia.xs`
- `get_open_api_parser_prompt`: base prompt function
- M11 Claude integration: dashboard AI assistant pattern
