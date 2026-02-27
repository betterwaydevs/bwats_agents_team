# BWATS Multi-Agent Team Workspace

This is the **command center** for the BWATS multi-project system. Claude Code is launched from this `team/` folder and coordinates work across all 5 subprojects using a 7-agent team.

## Projects Overview

| Project | Path | Tech Stack | Owner Agent |
|---------|------|------------|-------------|
| **bwats_xano** | `../bwats_xano/` | Xano/XanoScript/MCP | `backend-developer` |
| **nearshore-talent-compass** | `../nearshore-talent-compass/` | React/TypeScript/Vite/shadcn | `frontend-developer` |
| **linked_communication** | `../linked_communication/` | Chrome Extension (Manifest V3) | `chrome-ext-developer` |
| **bw_cold_recruiting** | `../bw_cold_recruiting/` | Chrome Extension (Manifest V3) | `chrome-ext-developer` |
| **resume_parser** | `../resume_parser/` | Python/ElasticSearch | `python-developer` |

## Team Roster (7 Agents)

### Coordination
- **project-manager** — Parses user requests, breaks into tasks, assigns to specialists, tracks progress. Never writes code directly.
- **product-owner** — Designs features, writes acceptance criteria, verifies delivered functionality matches requirements. Reads code but doesn't write production code.

### Developers
- **frontend-developer** — React/TypeScript/Lovable work in `nearshore-talent-compass`. Uses shadcn/ui, TanStack Query.
- **backend-developer** — Xano/XanoScript/MCP work in `bwats_xano`. MUST use tier-2 `xano-branch-guard` before every MCP write.
- **chrome-ext-developer** — Chrome extensions in `linked_communication` and `bw_cold_recruiting`. Manifest V3.
- **python-developer** — Python/data processing in `resume_parser`. ElasticSearch, Xano integration.

### Quality
- **qa-tester** — Cross-project testing: builds, Playwright, curl validation, integration flows.

## Two-Tier Agent Architecture

### Tier 1 — Team Agents (this folder)
Full Claude instances defined in `.claude/agents/`. These are the 7 agents listed above, launched from this workspace.

### Tier 2 — Task Subagents (inside bwats_xano)
Haiku-based cost-saving agents for routine Xano tasks. Located in `../bwats_xano/.claude/agents/prompts/`:
- `xano-branch-guard` — Branch safety verification (MANDATORY before MCP writes)
- `xano-data-agent` — Query Xano API data
- `xano-curl-validator` — Validate endpoints via curl
- `xano-mcp-reader` — Read-only MCP operations
- `doc-lookup` — XanoScript documentation search

The `backend-developer` team agent invokes tier-2 subagents when doing Xano work.

## Agent Teams — Default Work Mode

When a task involves **2+ independent workstreams** (e.g., backend + frontend, multiple files in different projects, research + implementation), **always use Claude agent teams** via `TeamCreate` to parallelize the work. Do not serialize work that can be done concurrently.

Examples of when to spawn a team:
- A feature that spans backend (Xano) + frontend (React) — spawn `backend-developer` + `frontend-developer`
- Multiple independent bug fixes — assign each to the appropriate developer agent
- Research + implementation — one agent explores while another builds
- Testing while developing — `qa-tester` validates as developers deliver

Only work single-threaded when the task is truly sequential or trivial (single file edit, quick lookup, one-liner fix).

## Cross-Project Rules

1. **Backend before frontend**: When a feature spans backend + frontend, build the API first, then the UI.
2. **Test before consume**: Validate API endpoints (via curl or MCP) before the frontend integrates them.
3. **Branch safety**: All Xano MCP writes MUST go through `xano-branch-guard` first. Production branches (`v1`, `live`) require explicit user confirmation.
4. **Project conventions**: Each subproject has its own CLAUDE.md with specific rules. Agents MUST read and follow them:
   - `../bwats_xano/CLAUDE.md` — XanoScript development phases, MCP verification, branch safety
   - `../nearshore-talent-compass/claude.md` — React/Lovable patterns, shadcn/ui, TanStack Query
   - `../linked_communication/CLAUDE.md` — Chrome extension rules, version incrementing, popup/sidepanel sync
   - `../resume_parser/CLAUDE.md` — Python project rules
5. **Version control**: Each project has its own git repo. Commit to the right repo.

## Environment

- Xano credentials (`XANO_TOKEN`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`) and MCP config live in `../bwats_xano/`, not here. The `backend-developer` agent accesses them when working from that directory.
- `.claude/settings.local.json` sets permissions for team-level operations (Bash, file access, web fetch)

## API Reference (Xano Canonicals)

| API Group | Canonical | Auth Required |
|-----------|-----------|---------------|
| tasks | i2KWpEI8 | Yes |
| candidates | wosIWFpR | Yes |
| prospects | zE_czJ22 | Yes |
| association | UVhvxoOh | Yes |
| messaging | 2CPT0xvS | Yes |
| auto_agents | 8MRsSZQv | Yes |
| auth | Ks58d17q | No (for login) |

## Feature Tracking

All tasks and features are tracked in [`features/`](./features/):

- **[`features/BACKLOG.md`](./features/BACKLOG.md)** — Master list with ID, title, priority, status, owner
- **`features/specs/<ID>.md`** — Full spec per task: requirements, acceptance criteria, dependencies
- **`features/progress/<ID>.md`** — Running log per task: work done, findings, blockers, current state

### Workflow
1. PM/PO creates a spec in `specs/` and adds a row to `BACKLOG.md`
2. When assigned, developer reads both spec and progress (if exists) before starting
3. Developer creates/updates `progress/<ID>.md` as they work
4. On completion, PM updates BACKLOG.md status to `done`

## Orchestrator Learning System

The team orchestrator maintains a knowledge base of discovered patterns, gotchas, and best practices in [LEARNINGS.md](./LEARNINGS.md).

**Scope**: Only learnings relevant to orchestration — agent coordination, permissions, team workflows, cross-project issues, and Claude Code configuration. Project-specific learnings (XanoScript, React, Python, etc.) belong in their respective project's own LEARNINGS.md.

### When to Consult LEARNINGS.md
- **Before troubleshooting**: When encountering agent errors, permission denials, or coordination issues — check LEARNINGS.md first
- **Before configuring agents or permissions**: Past mistakes are documented here
- **When a problem seems familiar**: It may have been solved before

### When to Update LEARNINGS.md
You MUST append to LEARNINGS.md when you discover:
- A permission or settings pattern that caused agent failures
- A cross-project coordination issue and how it was resolved
- A team workflow pattern that works well (or doesn't)
- A Claude Code configuration quirk (agent teams, MCP, settings)
- A solution to an error that took multiple attempts to fix

### How to Update LEARNINGS.md
1. Read the current LEARNINGS.md to find the appropriate category
2. Append a new entry with this format:
```markdown
### Brief Title
- **Issue**: What the problem or discovery is
- **Solution**: How to fix or handle it
- **Date**: YYYY-MM-DD
```
3. Keep entries concise but complete enough to be useful in future sessions

**IMPORTANT**: Do NOT wait until the end of the session. Append learnings immediately when discovered, so they aren't lost if the session ends unexpectedly.

## Workflow — Three Modes

### 1. Planning Mode
The user discusses high-level goals with the `product-owner`. The PO explores the codebase, designs expected behavior (wireframes, data flows, user stories), and writes detailed task specs with acceptance criteria. The `project-manager` helps estimate complexity and plan execution order. **Output**: fully specified tasks that developers can execute autonomously.

### 2. Building Mode
The `project-manager` drives execution — assigning tasks from the spec to developer agents, coordinating dependencies, tracking progress. Developers work autonomously using the detailed specs. `qa-tester` validates after each delivery. **Output**: working code that passes acceptance criteria.

### 3. Delivery Mode
The `product-owner` verifies delivered features against the original spec, then reports back to the user at a **high level**: what was built, whether it works, what they can do now. No implementation details unless the user asks.

### Communication Principle
- **User ↔ PO/PM**: Always high-level. Goals, outcomes, status. No code, no file paths, no stack traces.
- **PM ↔ Developers**: Always detailed. Full task specs, acceptance criteria, exact fields/endpoints/behaviors.
- **Developers ↔ Code**: The implementation layer. Developers own the "how".
