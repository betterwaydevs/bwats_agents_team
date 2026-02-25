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

- `.env` symlinks to `../.env` — provides `XANO_TOKEN`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`
- `.mcp.json` configures the Xano SSE MCP server
- `.claude/settings.local.json` enables agent teams and sets permissions

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
