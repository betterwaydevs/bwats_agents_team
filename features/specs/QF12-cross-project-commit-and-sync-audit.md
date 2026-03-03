# QF11: Cross-Project Commit & Sync Audit

**Priority**: High (cleanup)
**Type**: DEPLOY
**Projects**: ALL

## Problem

Multiple projects have accumulated uncommitted changes (modified files, untracked artifacts) and may have Xano dev code that hasn't been deployed to v1. This creates risk of lost work and makes it hard to track what's live vs what's in progress.

## Scope

### Part 1: Git Commit Audit (all 5 repos)

For each project, review uncommitted changes and either commit them or discard them intentionally.

| Project | Branch | Modified | Untracked | Notes |
|---------|--------|----------|-----------|-------|
| **team** | dev | 3 files | 4 files | New specs (L7, M12, QF9, QF10), updated BACKLOG.md, M10 delivery, SEC1 spec |
| **nearshore-talent-compass** | main | 2 files (package.json/lock) | 30+ files | Test scripts, screenshots, reports from QA runs |
| **bw_cold_recruiting** | first_version | 8 files | 1 dir | Modified core files + tenant_configs/ — needs review |
| **bwats_xano** | master | 14 files | 20+ files | Modified APIs/functions/tasks from recent deployments + docs/test artifacts |
| **linked_communication** | feature branch | 0 | 0 | Clean — MR #14 pending merge to main |

### Part 2: Xano Dev vs v1 Sync Check

Compare dev and v1 branches on Xano to identify:
- Code on dev that should be on v1 but isn't
- Code on v1 that was deployed via MCP but not reflected in local `bwats_xano` files
- Known issue: QF7 (`function.call` → `function.run` sweep) — 5+ files still using broken `function.call` on v1

## Acceptance Criteria

- [ ] AC1: All 5 git repos reviewed — changes either committed with descriptive messages or intentionally discarded
- [ ] AC2: No untracked files that should be tracked are left behind
- [ ] AC3: Xano dev vs v1 delta documented — list of endpoints/functions that differ
- [ ] AC4: Any discovered issues logged as new tasks in BACKLOG.md
- [ ] AC5: `bwats_xano` local files match what's actually deployed on v1 (or differences are documented)

## Notes

- `resume_parser` is not a git repo — skip or flag for setup
- `linked_communication` MR #14 needs to be merged by user on GitLab
- Test artifacts (screenshots, reports) in nearshore-talent-compass may be intentionally untracked — confirm with user
