# M12: AI Reply Context Enhancement — Knowledge Base & Project Context

**Type**: BOTH (Backend + Frontend + Extension)
**Priority**: Medium
**Status**: pending — needs design session

---

## Problem

AI reply suggestions (LinkedIn and email) lack sufficient context to generate high-quality responses. Key gaps:

1. **LinkedIn `suggest_reply` doesn't use `reply_agent_context`** — The email path already pulls this field (with `internal_qualifications_and_notes` as fallback), but LinkedIn does not. This means LinkedIn AI replies miss salary info, FAQ, talking points, and recruiter notes.

2. **No structured Q&A repository** — The `reply_agent_context` field is free-text per project. There's no searchable, reusable knowledge base of common questions and approved answers.

3. **Both channels should use full project context** — Project information (description, requirements, location, templates) should consistently feed into AI replies across LinkedIn and email.

## Current State

- **Reply Suggestion Agent** (GPT-4.1) is shared by both channels
- **Email replies** (`inbox_draft_reply_POST.xs`) already use: person info, email thread, project context, `reply_agent_context` OR `internal_qualifications_and_notes`
- **LinkedIn replies** (`suggest_reply_POST.xs`) use: person name/headline, last 10 messages, project name/description/templates, stages — but NOT `reply_agent_context` or `internal_qualifications_and_notes`
- **`reply_agent_context`** field exists on `project` table with structured template (salary, requirements, FAQ, talking points, notes for AI)

## Possible Directions (to be designed)

1. **Fix gaps** — Wire `reply_agent_context` into LinkedIn; ensure parity between channels
2. **Q&A CRUD** — Dedicated table of question-answer pairs per project (or global), with management UI
3. **Both** — Fix wiring + build Q&A system

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
