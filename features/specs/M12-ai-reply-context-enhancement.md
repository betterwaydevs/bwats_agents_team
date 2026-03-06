# M12: AI Reply Context Enhancement — Knowledge Base & Project Context

**Type**: BOTH (Backend + Frontend + Extension)
**Priority**: Medium
**Status**: in-progress

---

## Problem

AI reply suggestions (LinkedIn and email) lack sufficient context to generate high-quality responses. Key gaps:

1. **LinkedIn `suggest_reply` doesn't use `reply_agent_context`** — The email path already pulls this field (with `internal_qualifications_and_notes` as fallback), but LinkedIn does not. This means LinkedIn AI replies miss salary info, FAQ, talking points, and recruiter notes.

2. **No global communication style guide** — There's no centralized FAQ / Q&A repository that tells the AI how to answer common questions consistently. When someone asks about salary, availability, the company, the role — the AI should follow a standard style and approach.

3. **Both channels should use full project context** — Project information (description, requirements, location, templates) should consistently feed into AI replies across LinkedIn and email.

## Current State

- **Reply Suggestion Agent** (GPT-4.1) is shared by both channels
- **Email replies** (`inbox_draft_reply_POST.xs`) already use: person info, email thread, project context, `reply_agent_context` OR `internal_qualifications_and_notes`
- **LinkedIn replies** (`suggest_reply_POST.xs`) use: person name/headline, last 10 messages, project name/description/templates, stages — but NOT `reply_agent_context` or `internal_qualifications_and_notes`
- **`reply_agent_context`** field exists on `project` table with structured template (salary, requirements, FAQ, talking points, notes for AI)

## Solution

### Part 1: Wire `reply_agent_context` into LinkedIn suggest_reply

Fix the LinkedIn path to use the same project context the email path uses:
- Pull `reply_agent_context` from the project record
- Fall back to `internal_qualifications_and_notes` if empty
- Pass it into the AI agent prompt alongside the existing context

### Part 2: Global Communication Style Guide (new table + CRUD)

Create a **new table** `communication_style_guide` (or similar) that stores FAQ-style Q&A pairs as a global guide for the AI:

- **Purpose**: Teaches the AI *how* to respond — tone, style, and standard answers
- **Structure**: Question/topic + approved answer/guidance
- **Examples**:
  - "When someone asks about salary" → "We prefer to discuss compensation details after the technical evaluation. You can mention the range is competitive and depends on experience level."
  - "When someone asks about remote work" → "We offer hybrid arrangements. Emphasize flexibility."
  - "When a candidate asks about the interview process" → "Explain: initial screening, technical assessment, team fit interview, offer."
- **Scope**: Global (applies to all projects, not project-specific)
- **Management**: CRUD via the frontend (new section/tab in project settings or a dedicated settings page)

### Part 3: Feed both into AI replies

Update the AI reply agent to receive:
1. **Per-project context** (`reply_agent_context`) — project-specific info (salary, requirements, talking points)
2. **Global style guide** — the FAQ Q&A pairs from the new table — tells the AI the general communication style and standard answers

Both LinkedIn and email paths should use both sources.

## Acceptance Criteria

| # | Criteria |
|---|----------|
| AC1 | LinkedIn `suggest_reply` uses `reply_agent_context` (or `internal_qualifications_and_notes` fallback) — parity with email path |
| AC2 | New `communication_style_guide` table exists with fields: id, question/topic, answer/guidance, created_at, updated_at |
| AC3 | CRUD endpoints exist for the style guide (list, create, update, delete) |
| AC4 | Frontend UI allows managing style guide entries (add, edit, delete Q&A pairs) |
| AC5 | AI reply agent receives both per-project context AND global style guide Q&A pairs in its prompt |
| AC6 | Both LinkedIn and email reply paths include the style guide in AI context |
| AC7 | No regression — existing email AI replies continue to work correctly |

## Key Files

| File | Role |
|------|------|
| `bwats_xano/apis/auto_agents/suggest_reply_POST.xs` | LinkedIn suggest reply endpoint |
| `bwats_xano/apis/messaging/inbox_draft_reply_POST.xs` | Email AI draft endpoint |
| `bwats_xano/agents/reply_suggestion_agent.xs` | Shared AI agent (GPT-4.1) |
| `bwats_xano/tables/147_project.xs` | Project table (has `reply_agent_context`) |
| `linked_communication/extension/services/XanoClient.js` | Extension API client |
| `nearshore-talent-compass/src/apps/bwats/pages/BwatsProjectEdit.tsx` | Project edit UI (manages `reply_agent_context`) |
| `nearshore-talent-compass/src/apps/bwats/pages/BwatsEmailInbox.tsx` | Email inbox + AI draft UI |

## Execution Order

1. **Backend first**: Create table, CRUD endpoints, wire `reply_agent_context` into LinkedIn, update AI agent prompt
2. **Frontend second**: Build style guide management UI
3. **No extension changes expected** — extension calls the same `suggest_reply` endpoint
