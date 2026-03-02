# M11: Dashboard AI Assistant — Claude API via Membership Token

**Priority**: Medium
**Type**: FRONT
**Project**: bwats_dashboard

## Goal

Make the `/assistant` page in the dashboard functional. It should be a chat interface powered by Claude, using our existing Claude Code / Anthropic membership API key. The assistant has full context of the BWATS system — backlog, specs, delivery logs, learnings, agent roster — and can answer questions about project status, help draft specs, and suggest next steps.

## Approach

### Authentication
- Use the Anthropic API directly (not Claude Code CLI)
- API key stored as env var `ANTHROPIC_API_KEY` in the dashboard's `.env.local`
- Use the Claude API via `@anthropic-ai/sdk` npm package
- Model: `claude-sonnet-4-5-20250929` (fast, cost-effective for chat)

### System Context
The assistant gets a system prompt with:
- Current backlog summary (parsed from BACKLOG.md)
- Agent roster (from `.claude/agents/`)
- Recent delivery status (latest stages from delivery logs)
- LEARNINGS.md content
- The user can `@mention` a task ID to inject its full spec + delivery log into context

### API Route
- `POST /api/assistant/chat` — accepts `{ messages: Message[], taskId?: string }`
- Streams response back via SSE or ReadableStream
- Builds system prompt from project files on each request (cached for 60s)
- If `taskId` provided, includes that task's spec + delivery log in context

### UI (already partially exists at `/assistant`)
- Chat interface with message history
- Input box with send button
- Streaming response display
- Optional: `@task:M3` syntax in input to inject task context
- Messages persist in `localStorage` for session continuity

## Acceptance Criteria
- [ ] AC1: Chat sends messages to Claude API and streams responses
- [ ] AC2: System prompt includes backlog summary, learnings, agent roster
- [ ] AC3: Mentioning a task ID injects its spec + delivery into context
- [ ] AC4: Responses stream in real-time (not wait for full completion)
- [ ] AC5: Works on mobile and desktop
- [ ] AC6: API key is server-side only (never exposed to client)

## Technical Notes
- The `/assistant` nav item already exists in sidebar + bottom nav
- Check if the page at `src/app/assistant/page.tsx` has any existing UI
- Use `@anthropic-ai/sdk` for the API call — it supports streaming natively
- Keep context lean: summarize backlog, don't dump entire files
- Cost control: use sonnet, limit context to ~8K tokens of system prompt

## References
- Anthropic SDK: `npm install @anthropic-ai/sdk`
- Dashboard: `~/projects/bwats/bwats_dashboard/`
- Existing assistant page: `src/app/assistant/page.tsx`
