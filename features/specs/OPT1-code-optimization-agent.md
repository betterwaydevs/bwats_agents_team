# OPT1: Security & Optimization Review Agent — Unified Post-DEV Quality Gate

**Status**: Draft
**Priority**: High (Security merged with Optimization)
**Owner**: TBD
**Created**: 2026-03-03
**Updated**: 2026-03-05

## Overview

Enhance the existing `security-reviewer` agent to become a unified **Security & Optimization Review** gate that validates both security and code quality before QA. This single agent reviews code for security vulnerabilities, performance issues, code quality, and adherence to best practices.

## Problem Statement

Currently:
- The `security-reviewer` (SEC gate) only checks for security vulnerabilities (OWASP Top 10, secrets, auth issues)
- There's no automated check for **performance, code quality, or optimization issues**
- Running two separate agents (SEC + OPT) would add unnecessary latency and complexity to the pipeline

The solution is to **merge optimization into the existing SEC agent**, creating a comprehensive quality gate.

## Goals

1. **Maintain** the existing security review gate (already working as SEC)
2. **Expand** security-reviewer to include performance and code quality checks
3. **Provide** actionable optimization suggestions alongside security findings
4. **Keep** a single quality gate (not two separate agents) for pipeline efficiency
5. **Ensure** both secure AND optimized code reaches QA

## Proposed Solution

### Current Pipeline Flow (No Change)
```
PM → DEV → **SEC (Security & Optimization)** → QA → PO → User
```

The pipeline remains the same. The `security-reviewer` agent is enhanced, not replaced.

### Enhanced Agent Responsibilities

The unified **security-reviewer** agent will now check **10 categories** instead of 9:

#### Security Categories (1-9) — ALREADY IMPLEMENTED
1. Secrets & Credentials
2. Input Validation & Injection Attacks
3. Authentication & Authorization
4. Frontend Security (React/Extensions)
5. API Security (Xano Backend)
6. Extension Security (Chrome Extensions)
7. Third-Party Dependencies
8. Data Privacy
9. Team Orchestration Security (Self-Audit)

#### NEW: Performance & Code Quality (Category 10)
10. **Performance & Optimization**:
   - Algorithm efficiency (O(n²) loops, redundant operations)
   - Memory usage (large object cloning, memory leaks)
   - Database query optimization (N+1 queries, missing indexes)
   - Frontend performance (unnecessary re-renders, large bundle sizes)
   - Code smells (duplicate code, overly complex functions, deep nesting)
   - Best practices (language/framework-specific patterns)
   - Maintainability issues (missing error handling, poor naming)

### Decision: Review-Only (No Auto-Fix)

**Chosen approach**: The agent provides **recommendations only**, never auto-fixes.

**Rationale**:
- Auto-fixing code can introduce bugs or change intended behavior
- Developers need to understand and approve optimizations
- Some "optimizations" are trade-offs (e.g., readability vs. performance)
- Keeps the agent's role clear: **reviewer**, not **implementer**

## Acceptance Criteria

### AC1: Agent Enhancement
- [ ] `security-reviewer` agent updated with Category 10 (Performance & Optimization)
- [ ] Agent checklist now includes 10 categories (not 9)
- [ ] Agent instructions explicitly state: "Review for BOTH security AND performance/quality"

### AC2: Performance Analysis — Algorithm Efficiency
**Given** a code change with O(n²) nested loops that could be O(n)
**When** the security-reviewer runs
**Then** it flags a **MEDIUM** or **HIGH** finding under "Category 10: Performance & Optimization"
**And** provides the line number and suggests the optimized approach
**And** includes severity based on impact (HIGH if critical path, MEDIUM if edge case)

### AC3: Performance Analysis — Database Queries
**Given** a Xano function with N+1 query pattern
**When** the security-reviewer runs
**Then** it flags a **HIGH** finding
**And** recommends using batch queries or joins
**And** explains the performance impact

### AC4: Code Quality — Duplicate Code
**Given** a code change with duplicated logic across multiple files
**When** the security-reviewer runs
**Then** it flags a **LOW** or **MEDIUM** finding
**And** suggests extracting to a shared function/utility
**And** notes the maintainability benefit

### AC5: Code Quality — Code Smells
**Given** a function with 200+ lines or 5+ levels of nesting
**When** the security-reviewer runs
**Then** it flags a **LOW** finding for complexity
**And** suggests breaking into smaller functions
**And** notes the readability/maintainability issue

### AC6: Frontend Performance — React Optimization
**Given** a React component with missing `useMemo` or `useCallback` on expensive operations
**When** the security-reviewer runs
**Then** it flags a **MEDIUM** finding
**And** explains the unnecessary re-render cost
**And** provides example of how to fix it

### AC7: Best Practices — Framework Patterns
**Given** code violating language/framework best practices (e.g., XanoScript `function.call` instead of `function.run`)
**When** the security-reviewer runs
**Then** it flags a **MEDIUM** finding
**And** references the correct pattern from project CLAUDE.md or LEARNINGS.md
**And** explains why the pattern matters

### AC8: Unified Report
**Given** the enhanced security-reviewer completes a review
**When** it writes the report to `features/delivery/<ID>.md`
**Then** the report includes:
  - All 9 security categories (as before)
  - NEW: Category 10: Performance & Optimization section
  - Findings grouped by category
  - Each finding has severity (CRITICAL/HIGH/MEDIUM/LOW)
  - Summary counts security vs. optimization issues separately
**And** the recommendation logic remains: REJECT if CRITICAL, CONDITIONAL if MEDIUM/LOW

### AC9: Severity Mapping for Optimization Issues
**Given** the agent finds optimization issues
**When** assigning severity
**Then** it uses these guidelines:
  - **CRITICAL**: Never for optimization (reserved for security only)
  - **HIGH**: Performance issues on critical paths (auth, data loading, API responses) that cause measurable UX degradation
  - **MEDIUM**: Performance issues on secondary paths, significant code smells, anti-patterns
  - **LOW**: Minor optimizations, style improvements, non-critical best practices

### AC10: No Auto-Fix
**Given** the agent finds optimization opportunities
**When** it generates the report
**Then** it NEVER applies fixes automatically
**And** it provides clear "before/after" code examples in recommendations
**And** DEV must manually review and apply suggested changes

## Technical Considerations

### Scope of Analysis
- **In scope**: Code changed in the current task (`git diff origin/dev --name-only` or similar)
- **Out of scope**: Full codebase audit (too expensive, not the reviewer's role)
- **Focus**: Only review modified/added code, not unchanged files

### Analysis Techniques

#### Security Analysis (Categories 1-9) — EXISTING
- Pattern matching (grep for secrets, unsafe functions)
- Static code review (read files, trace data flow)
- Checklist-based verification (auth checks, input validation, etc.)

#### NEW: Performance & Optimization Analysis (Category 10)
- **Algorithm complexity**: Look for nested loops, redundant iterations, unnecessary sorting
- **Database patterns**: Identify N+1 queries, missing batch operations, inefficient filters
- **Frontend performance**: Check for missing memoization, large bundle imports, unnecessary state
- **Code smells**: Detect duplicate code, overly long functions, deep nesting, magic numbers
- **Framework best practices**: Cross-reference with project CLAUDE.md and LEARNINGS.md
- **Memory usage**: Look for large object cloning, potential leaks (event listeners not cleaned up)

### Integration Points
- **Input**: Task ID, git diff, project path(s)
- **Output**: Unified security + optimization report in delivery log
- **Communication**: Same as before — SendMessage to PM with APPROVE/CONDITIONAL/REJECT
- **No code changes**: Agent reads and reports only, never edits

### Agent Context
The enhanced agent needs access to:
- Changed files via `git diff`
- Project-specific conventions (CLAUDE.md, LEARNINGS.md in each project)
- Framework documentation (React, XanoScript, Chrome Extension best practices)
- Previous delivery logs (to learn from past issues)

## Dependencies

- **SEC1** (Security Review Agent) — DONE. This task enhances that agent.
- **W1** (Multi-Agent Team Delivery Workflow) — DONE. Pipeline already in place.
- No new dependencies — this is an enhancement to existing infrastructure.

## Non-Goals (for v1)

- **Runtime performance profiling**: Only static code analysis, no benchmarking or profiling tools
- **Automated refactoring**: Agent suggests, never auto-fixes
- **Full codebase audit**: Only review changed files in the task
- **Cross-project recommendations**: Each project reviewed independently (though patterns can be learned)
- **Performance regression testing**: No before/after performance metrics (future enhancement)

## Resolved Questions

1. **Auto-fix vs. suggestions**: ✅ **Suggestions only**. DEV must manually apply changes.
2. **Failure threshold**: ✅ **Same as security rules**: REJECT if CRITICAL (security only), CONDITIONAL if MEDIUM/LOW (optimization issues).
3. **Model choice**: ✅ **Sonnet**. Already used for security-reviewer, quality matters more than speed.
4. **Exemptions**: ✅ **No exemptions**. All code gets reviewed. Agent can use LOW severity for minor issues.
5. **Scope creep prevention**: ✅ **Severity guidelines** + **pragmatic rule** ("not every theoretical issue is worth blocking") already in agent instructions.

## Implementation Plan

### Phase 1: Agent Update
- [x] Read current `security-reviewer` agent (`.claude/agents/security-reviewer.md`)
- [ ] Add **Category 10: Performance & Optimization** to the checklist
- [ ] Define optimization patterns per project type:
  - **XanoScript/Backend**: Database queries, API efficiency, function complexity
  - **React/Frontend**: Component performance, bundle size, unnecessary re-renders
  - **Chrome Extensions**: Manifest permissions, content script efficiency, message passing
  - **Python**: Algorithm efficiency, pandas operations, ES query optimization
- [ ] Update agent instructions to check all 10 categories on every review
- [ ] Add severity mapping guidelines for optimization issues (never CRITICAL, HIGH only for critical paths)

### Phase 2: Report Format Update
- [ ] Update `features/DELIVERY_FORMAT.md` to show Category 10 in SEC report examples
- [ ] Ensure report template separates security findings from optimization findings
- [ ] Add summary counts: "Security: X CRITICAL, Y HIGH" + "Optimization: Z HIGH, W MEDIUM"

### Phase 3: Testing
- [ ] Test on code with known performance issues:
  - N+1 query pattern
  - Nested loops
  - Missing React memoization
  - Duplicate code
- [ ] Verify agent flags issues with correct severity
- [ ] Verify report format is clear and actionable
- [ ] Test end-to-end: DEV → SEC (with optimization findings) → DEV fixes → SEC re-review → QA

### Phase 4: Documentation
- [ ] Update `CLAUDE.md` to note SEC agent now reviews security + optimization
- [ ] Update `MEMORY.md` with optimization review rules
- [ ] Update SEC1 spec to mark as "expanded to include optimization (OPT1)"
- [ ] Document common optimization patterns in LEARNINGS.md as they're discovered

## Success Metrics

- **Security metrics** (already tracked):
  - 0 CRITICAL vulnerabilities reach QA
  - < 10% false positive rate
- **NEW: Optimization metrics**:
  - % of tasks with performance findings (baseline — not a KPI, just visibility)
  - % of optimization suggestions accepted by DEV (target > 70% = suggestions are valuable)
  - Time added to review (should be < 3 minutes for optimization checks, total < 8 minutes for full SEC review)
  - No increase in DEV rework cycles (optimization shouldn't significantly delay delivery)

## Related Tasks

- **SEC1** (Security Review Agent) — This task enhances SEC1. Mark SEC1 as "expanded to include OPT1".
- **W1** (Multi-Agent Team Delivery Workflow) — Delivery pipeline already supports SEC gate.
- **M8** (Delivery Supervisor) — Process compliance checker. SEC is content review.

## Example Report (Security + Optimization)

```markdown
## SEC: Security & Optimization Review

- **Status**: done
- **Agent**: security-reviewer
- **Date**: 2026-03-05 14:23
- **Commit Range**: origin/dev..HEAD
- **Projects Reviewed**: bwats_xano

### Files Reviewed

- `bwats_xano/functions/messaging/send_message.js` (67 lines changed)

### Findings

#### CRITICAL: SQL Injection — send_message.js:45
**Category**: 2 (Input Validation & Injection)
**File**: `bwats_xano/functions/messaging/send_message.js:45`
**Issue**: `recipient_id` interpolated directly into query without validation.
```js
var query = "SELECT * FROM users WHERE id = " + recipient_id;
```
**Impact**: Attacker can inject SQL to access unauthorized data.
**Recommendation**: Use query builder or validate `recipient_id` is numeric.
**Status**: 🔴 MUST FIX

#### HIGH: N+1 Query Pattern — send_message.js:78-92
**Category**: 10 (Performance & Optimization)
**File**: `bwats_xano/functions/messaging/send_message.js:78-92`
**Issue**: Loading user profiles in a loop (15 iterations observed).
```js
for (var msg of messages) {
  var user = db.users.getOne(msg.sender_id);  // DB call per iteration
  msg.sender_name = user.name;
}
```
**Impact**: 15 database calls instead of 1. Scales poorly with message count.
**Recommendation**: Use batch query or join:
```js
var user_ids = messages.map(m => m.sender_id);
var users = db.users.getMany(user_ids);  // Single batch call
var userMap = Object.fromEntries(users.map(u => [u.id, u]));
messages.forEach(m => m.sender_name = userMap[m.sender_id].name);
```
**Status**: 🟠 SHOULD FIX

#### MEDIUM: Missing Input Length Validation — send_message.js:23
**Category**: 2 (Input Validation)
**File**: `bwats_xano/functions/messaging/send_message.js:23`
**Issue**: `message_text` not validated for length.
**Impact**: Could allow very long messages (DoS risk, storage issues).
**Recommendation**: Add max length check (e.g., 10,000 chars).
**Status**: 🟡 SHOULD FIX

### Summary

**Security Issues**:
- **CRITICAL**: 1 (SQL injection)
- **HIGH**: 0
- **MEDIUM**: 1 (input validation)
- **LOW**: 0

**Optimization Issues**:
- **HIGH**: 1 (N+1 query)
- **MEDIUM**: 0
- **LOW**: 0

### Recommendation

**REJECT** — Critical SQL injection must be fixed before QA. High-priority performance issue (N+1 query) should also be addressed.

### Actions Required

1. Fix SQL injection in `send_message.js:45` (CRITICAL — security)
2. Optimize N+1 query pattern in `send_message.js:78-92` (HIGH — performance)
3. Add input length validation on `message_text` (MEDIUM — security)
4. Re-submit for SEC review after fixes

### Sign-off

- **Reviewer**: security-reviewer
- **Status**: ❌ REJECTED
- **Next Step**: DEV to fix CRITICAL and HIGH issues, then re-submit
```

---

## Next Steps

1. ✅ Review current security-reviewer agent
2. [ ] Update agent with Category 10 checklist
3. [ ] Test on sample code with performance issues
4. [ ] Update documentation (CLAUDE.md, DELIVERY_FORMAT.md)
5. [ ] Run on next task delivery to validate in production
