# Codex Agent Setup

This directory mirrors the team agent prompts used by Claude so the same workspace can run with Codex.

## Layout

- `.codex/agents/*.md` -> Codex agent prompt copies
- `../AGENTS.md` -> Codex workspace-level orchestration instructions

## Sync

If you update `.claude/agents/*.md`, run:

```bash
./scripts/sync-claude-to-codex.sh
```

This refreshes `.codex/agents/` from the Claude source definitions.
