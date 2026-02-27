# Team Orchestrator Learnings

Discovered patterns, gotchas, and best practices for the team orchestrator (the main Claude instance running from `team/`).

**Scope**: Only record learnings relevant to orchestration — agent coordination, permissions, team workflows, cross-project issues, and Claude Code configuration. Project-specific learnings (XanoScript, React, etc.) belong in their respective project's LEARNINGS.md.

---

## Permissions & Agent Configuration

### File permission patterns must include absolute paths
- **Issue**: Agents running in "don't ask" mode use absolute paths for file tools (Edit, Write, Glob), but `settings.local.json` only had relative patterns (`../**`). This caused `Edit` permission denials.
- **Solution**: Every file tool permission needs BOTH relative (`../**`) and absolute (`/home/pablo/projects/bwats/**`) patterns in `settings.local.json`.
- **Date**: 2026-02-26

### Xano MCP config belongs in bwats_xano only
- **Issue**: Having `.mcp.json` and `.env` (with XANO_TOKEN) at the team level was redundant — all Xano work is delegated to the `backend-developer` agent working from `bwats_xano/`.
- **Solution**: Removed `.env` symlink, `.mcp.json`, and all `mcp__xano__*` permissions from `team/`. Xano credentials and MCP config live exclusively in `../bwats_xano/`.
- **Date**: 2026-02-26

---

## Team Coordination

_(Add entries as patterns are discovered)_

---

## Cross-Project Workflow

_(Add entries as patterns are discovered)_

---

## How to Add Learnings

Append new entries to the appropriate category using this format:
```markdown
### Brief Title
- **Issue**: What the problem or discovery is
- **Solution**: How to fix or handle it
- **Date**: YYYY-MM-DD
```
