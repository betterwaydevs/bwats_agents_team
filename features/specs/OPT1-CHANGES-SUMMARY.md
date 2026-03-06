# OPT1 Spec Update — Merged with Security Review

**Date**: 2026-03-05
**Change Type**: Specification redesign (merge with SEC1)

## What Changed

### Before (Original OPT1)
- Proposed a **separate** "optimizer" agent
- Would create a new pipeline stage: PM → DEV → **OPTIMIZER** → QA
- Would add latency and complexity with two separate quality gates (SEC + OPT)

### After (Updated OPT1)
- **Enhances the existing** `security-reviewer` agent instead of creating a new one
- Pipeline remains: PM → DEV → **SEC (Security + Optimization)** → QA
- Single unified quality gate that checks **10 categories** instead of 9
- Categories 1-9: Security (already implemented)
- Category 10: **NEW** — Performance & Optimization

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Merge with SEC** instead of separate agent | Avoids dual quality gates, reduces latency, simpler pipeline |
| **Review-only** (no auto-fix) | Prevents unintended behavior changes, keeps agent as reviewer not implementer |
| **Sonnet model** (not Haiku) | Quality matters more than speed, already used for SEC |
| **CRITICAL severity reserved for security** | Optimization issues max at HIGH (only on critical paths) |
| **Same recommendation logic** | REJECT if CRITICAL, CONDITIONAL if MEDIUM/LOW |

## What Gets Added to Security-Reviewer

### Category 10: Performance & Optimization Checklist

The agent will now check for:

1. **Algorithm Efficiency**
   - Nested loops (O(n²) when O(n) possible)
   - Redundant iterations
   - Unnecessary sorting/filtering

2. **Database Query Optimization**
   - N+1 query patterns
   - Missing batch operations
   - Inefficient filters (client-side when DB could do it)

3. **Frontend Performance**
   - Missing memoization (`useMemo`, `useCallback`)
   - Unnecessary re-renders
   - Large bundle imports (import whole library for one function)

4. **Code Smells**
   - Duplicate code across files
   - Overly long functions (> 100-200 lines)
   - Deep nesting (> 4-5 levels)
   - Magic numbers/strings

5. **Framework Best Practices**
   - XanoScript: `function.run` vs `function.call`
   - React: proper hook usage, component patterns
   - Chrome Extensions: minimal permissions, efficient message passing

6. **Memory Usage**
   - Large object cloning
   - Potential memory leaks (event listeners not cleaned up)

### Severity Mapping for Optimization

- **CRITICAL**: ❌ Never (reserved for security only)
- **HIGH**: Performance issues on critical paths (auth, data loading, API responses) with measurable UX impact
- **MEDIUM**: Performance issues on secondary paths, significant code smells, anti-patterns
- **LOW**: Minor optimizations, style improvements, non-critical best practices

## Report Format Changes

### Before (Security Only)
```markdown
### Summary
- **CRITICAL**: 1
- **HIGH**: 0
- **MEDIUM**: 2
- **LOW**: 1
```

### After (Security + Optimization)
```markdown
### Summary

**Security Issues**:
- **CRITICAL**: 1 (SQL injection)
- **HIGH**: 0
- **MEDIUM**: 1 (input validation)
- **LOW**: 0

**Optimization Issues**:
- **HIGH**: 1 (N+1 query)
- **MEDIUM**: 1 (code duplication)
- **LOW**: 2 (naming, comments)
```

Findings are tagged with **Category** number so it's clear which is security vs. optimization.

## Implementation Path

1. **Update agent** (`.claude/agents/security-reviewer.md`)
   - Add Category 10 checklist
   - Add optimization pattern guides per project type
   - Update report format to separate security/optimization

2. **Update documentation**
   - `features/DELIVERY_FORMAT.md` — show new report format
   - `CLAUDE.md` — note SEC now covers optimization
   - `MEMORY.md` — add optimization review rules

3. **Test on sample code** with known performance issues
   - N+1 queries, nested loops, missing memoization, duplicate code

4. **Deploy** on next task delivery

## Benefits of This Approach

✅ **No pipeline changes** — SEC already exists and works
✅ **Single quality gate** — one review, not two
✅ **No added latency** — optimization checks add ~3 min to existing SEC review
✅ **Unified report** — security + optimization in one place
✅ **Leverages existing infrastructure** — team creation, sign-off chain, delivery format all unchanged
✅ **Consistent severity model** — same CRITICAL/HIGH/MEDIUM/LOW scale, same REJECT/CONDITIONAL/APPROVE logic

## Related Files Updated

- `/home/pablo/projects/bwats/team/features/specs/OPT1-code-optimization-agent.md` — Fully rewritten
- This summary document

## Related Files To Update (Implementation Phase)

- `.claude/agents/security-reviewer.md` — Add Category 10
- `features/DELIVERY_FORMAT.md` — Show new report format
- `CLAUDE.md` — Document SEC covers optimization
- `MEMORY.md` — Add optimization rules
- `features/specs/SEC1-security-review-agent.md` — Note expansion to include OPT1

## Status

- [x] Spec rewritten and updated
- [ ] Agent implementation (Phase 1)
- [ ] Documentation updates (Phase 2)
- [ ] Testing (Phase 3)
- [ ] Deployment (Phase 4)
