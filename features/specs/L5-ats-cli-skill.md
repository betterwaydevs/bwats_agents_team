# L5: /ats CLI Skill — Interactive ATS from CLI

## Summary
A Claude Code skill that lets users manage their ATS (projects, pipeline, candidates, prospects) directly from the CLI via `/ats` command. Connects to the same Xano backend APIs the frontend uses.

## Location
`team/.claude/skills/ats/`

## Files
- `SKILL.md` — Main skill definition (~200 lines)
- `references/api-auth.md` — Auth endpoints, token handling, session schema
- `references/api-projects.md` — Projects, stages, associations, pipeline
- `references/api-people.md` — Candidates, prospects, notes, search

## Key Features
- Browser-based token authentication (no passwords in CLI)
- Session persistence between invocations
- Dashboard showing active projects
- Full CRUD on projects, stages, people
- Pipeline visualization with stage counts
- Search within projects
- Notes management (free action, no confirmation)
- Stage changes and deletions require confirmation

## Dependencies
- L6 (CLI Token Page) — Optional enhancement for smoother token copy flow. Without it, users copy token from browser console.
