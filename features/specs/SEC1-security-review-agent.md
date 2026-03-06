# SEC1: Security Review Agent

**Priority**: High
**Type**: TEAM
**Project**: team (workspace-level)
**Status**: done (implemented + expanded with OPT1)

---

**NOTE**: This agent has been **expanded** to include performance and code quality review (originally specified in OPT1). The `security-reviewer` agent now checks **10 categories**: 1-9 for security (as originally specified below), and Category 10 for Performance & Optimization (from OPT1). See `features/specs/OPT1-code-optimization-agent.md` for the optimization checklist details.

---

## Problem

Code reaches the delivery pipeline without any systematic security review. Developers might introduce:
- Command injection vulnerabilities (unsanitized inputs to shell commands)
- SQL injection (unsafe query construction)
- XSS vulnerabilities (unescaped user input in HTML)
- Authentication/authorization bypasses
- Secrets leaked in code (API keys, tokens)
- CSRF vulnerabilities
- Insecure cryptography
- Path traversal attacks
- SSRF (Server-Side Request Forgery)
- Other OWASP Top 10 risks

**We need an automated security agent that reviews code changes BEFORE the PM signs off for delivery.**

## Solution

Create a **security-reviewer** agent that runs as part of the delivery pipeline, positioned **after DEV completes but before QA begins testing**. This ensures security issues are caught early, before extensive QA investment.

### Pipeline Position

**Current flow**: PM → DEV → QA → PO → User

**New flow**: PM → DEV → **SEC** → QA → PO → User

The security agent becomes a mandatory gate. DEV cannot hand off to QA until SEC approves.

## Agent Definition

### Name & Role
- **Name**: `security-reviewer`
- **Location**: `.claude/agents/security-reviewer.md`
- **Model**: `sonnet` (needs reasoning for security analysis)
- **Scope**: Cross-project (reviews backend, frontend, extension, Python code)

### Tools Required
- `Read` — Read changed files from git diff
- `Grep` — Search for patterns (hardcoded secrets, unsafe functions)
- `Bash` — Run `git diff`, static analysis tools (if available)
- `Edit` — (Optional) Auto-fix simple issues like removing debug tokens

### Inputs
- **Task ID**: Which task to review
- **Git commit range**: Compare against base branch to see what changed
- **Project context**: Which projects were modified (backend/frontend/ext/python)

### Outputs
- Security review report appended to delivery log
- Per-file security findings with severity (CRITICAL/HIGH/MEDIUM/LOW)
- Recommendation: APPROVE / CONDITIONAL APPROVE / REJECT

## Security Review Checklist

The agent reviews code changes for:

### 1. Secrets & Credentials
- ❌ Hardcoded API keys, passwords, tokens
- ❌ Database credentials in code
- ❌ AWS/cloud provider keys
- ✅ All secrets must be in `.env` or environment variables
- ✅ Check that `.env` is in `.gitignore`

### 2. Input Validation & Injection Attacks
- ❌ Unsanitized user input passed to shell commands
- ❌ Raw string interpolation in SQL queries (XanoScript)
- ❌ Unsanitized input in `innerHTML`, `dangerouslySetInnerHTML`
- ❌ User-controlled URLs in `api.request` (SSRF risk)
- ✅ Input validation on all user-provided data
- ✅ Parameterized queries or query builder usage
- ✅ HTML escaping on user content

### 3. Authentication & Authorization
- ❌ Endpoints missing authentication checks
- ❌ Authorization bypasses (checking wrong user ID)
- ❌ Insecure session handling
- ❌ Missing rate limiting on login/sensitive endpoints
- ✅ All protected endpoints verify `var.auth_user`
- ✅ Ownership checks (user can only access their own data)
- ✅ Role-based access control where needed

### 4. Frontend Security (React/Extensions)
- ❌ XSS via `dangerouslySetInnerHTML` with user data
- ❌ Unsafe `eval()` or `new Function()`
- ❌ CSRF on state-changing requests (missing CSRF tokens)
- ❌ Exposing sensitive data in localStorage without encryption
- ✅ Content Security Policy headers configured
- ✅ HTTPS-only cookies for auth tokens

### 5. API Security (Xano Backend)
- ❌ Missing input validation on API parameters
- ❌ Returning more data than needed (over-fetching)
- ❌ No rate limiting on expensive operations
- ❌ Verbose error messages leaking implementation details
- ✅ Error responses are generic to external callers
- ✅ Pagination on list endpoints (no unbounded queries)

### 6. Extension Security (Chrome Extensions)
- ❌ Broad permissions in `manifest.json` not justified
- ❌ `unsafe-eval` in CSP without strong justification
- ❌ Exposing extension APIs to untrusted web pages
- ❌ Sending sensitive data to external domains
- ✅ Minimal permissions (only what's needed)
- ✅ Content scripts validate messages from web pages

### 7. Third-Party Dependencies
- ❌ Using known-vulnerable package versions
- ❌ Importing packages from untrusted sources
- ✅ (Optional) Run `npm audit` / `pip audit` if available
- ✅ Dependencies are justified and reviewed

### 8. Data Privacy
- ❌ Logging sensitive user data (passwords, tokens, PII)
- ❌ Sending PII to third-party services without consent
- ❌ Missing data retention policies
- ✅ Passwords never logged or stored in plaintext
- ✅ PII handling follows data minimization principle

### 9. Team Orchestration Security (Self-Audit)
- ❌ `.env` or `.env.*` files exposed via Read permissions in `.claude/settings.local.json`
- ❌ MCP configurations exposing sensitive tokens to unauthorized agents
- ❌ Agent permissions allowing writes to sensitive system files
- ❌ Cloud service credentials (Kamatera, Resend, Xano) accessible without restrictions
- ❌ `.git/config` or git credentials exposed to agents
- ✅ `.env` files explicitly denied in permissions with `"deny": ["Read(.env)", "Read(.env.*)"]`
- ✅ MCP configs (`.mcp.json`) only accessible by specific agents that need them
- ✅ `XANO_TOKEN`, API keys, secrets never passed as plaintext in agent instructions
- ✅ Agent permissions follow principle of least privilege
- ✅ No sensitive data in `.claude/` config files (keys, tokens, passwords)

**Self-Audit Scope**: The security agent MUST review the team orchestration system itself:
- `.claude/settings.local.json` — permissions configuration
- `.claude/agents/*.md` — agent definitions (no hardcoded secrets)
- `../bwats_xano/.mcp.json` — MCP configuration (token handling)
- All `.env` and `.env.*` files across projects (must be in `.gitignore`, denied to agents)
- Agent prompt files in tier-2 subagents (`../bwats_xano/.claude/agents/prompts/`)

**Why This Matters**: AI agents calling external systems (MCP servers, APIs) could inadvertently expose credentials if permissions aren't locked down. We must ensure:
1. Agents can't read `.env` files that contain secrets
2. MCP tokens are isolated to the agents that need them
3. No secrets leak into agent instructions or logs
4. Cloud API keys (Kamatera, Resend) aren't accessible to general-purpose agents

## Review Process

### Step 1: Identify Changed Files
```bash
# Get diff from base branch (dev or main)
git diff origin/dev --name-only
```

### Step 2: Read Changed Files
For each changed file:
- Read full file content
- Understand the context and purpose
- Note what user inputs are accepted
- Trace data flow from input → processing → output

### Step 3: Apply Security Checklist
For each category above:
- Search for anti-patterns (grep for dangerous functions)
- Manually review logic for vulnerabilities
- Check if mitigations are present

### Step 4: Generate Report
Append to `features/delivery/<ID>.md`:

```markdown
## SEC: Security Review

**Date**: YYYY-MM-DD HH:MM
**Reviewer**: security-reviewer (sonnet)
**Commit Range**: abc123..def456
**Projects Reviewed**: bwats_xano, nearshore-talent-compass

### Files Reviewed

- `bwats_xano/functions/auto_agents/suggest_reply.js` (43 lines changed)
- `nearshore-talent-compass/src/components/ProspectsGrid.tsx` (12 lines changed)

### Findings

#### CRITICAL: SQL Injection in suggest_reply.js (Line 23)
**File**: `bwats_xano/functions/auto_agents/suggest_reply.js:23`
**Issue**: User input `conversation_id` is interpolated directly into query without validation.
```js
var query = "SELECT * FROM messages WHERE conversation_id = " + conversation_id;
```
**Impact**: Attacker can inject SQL to access unauthorized data.
**Recommendation**: Use query builder or validate `conversation_id` is numeric.
**Status**: 🔴 MUST FIX

#### MEDIUM: Missing Input Validation (Line 45)
**File**: `bwats_xano/functions/auto_agents/suggest_reply.js:45`
**Issue**: `message_text` not validated before processing.
**Impact**: Could lead to unexpected behavior or DoS with very long inputs.
**Recommendation**: Add length limit (e.g., max 10k chars).
**Status**: 🟡 SHOULD FIX

#### LOW: Verbose Error Message (Line 78)
**File**: `nearshore-talent-compass/src/components/ProspectsGrid.tsx:78`
**Issue**: Error stack trace shown in UI during development.
**Impact**: In production, could leak implementation details.
**Recommendation**: Replace with generic error message in prod builds.
**Status**: 🟢 CONSIDER FIXING

### Summary

- **CRITICAL**: 1 (SQL injection)
- **HIGH**: 0
- **MEDIUM**: 1 (input validation)
- **LOW**: 1 (verbose errors)

### Recommendation

**REJECT** — Critical SQL injection vulnerability must be fixed before proceeding to QA.

### Actions Required

1. Fix SQL injection in `suggest_reply.js:23` — use query builder or type validation
2. Add input length validation on `message_text`
3. Re-submit for security review after fixes

### Sign-off

- **Reviewer**: security-reviewer
- **Status**: ❌ REJECTED (security issues found)
- **Next Step**: DEV to fix critical issues and re-submit
```

## Integration with Delivery Pipeline

### Modified Workflow

1. **PM assigns task** → DEV
2. **DEV implements** → marks implementation complete
3. **PM triggers SEC review** → `security-reviewer` agent launched
4. **SEC reviews code**:
   - If APPROVED → QA proceeds with testing
   - If CONDITIONAL APPROVE → QA proceeds but issues noted for future fix
   - If REJECTED → back to DEV for fixes
5. **QA tests** (after SEC approval)
6. **PO accepts** (after QA pass)
7. **User approves** (final gate)

### PM's Responsibility

The `project-manager` agent must:
1. After DEV reports done, invoke `security-reviewer` before assigning to QA
2. Read the security report
3. If REJECTED, send back to DEV with specific findings
4. Only proceed to QA after SEC gives APPROVE or CONDITIONAL APPROVE
5. Include security status in the delivery summary

### Team Creation

Security review happens within the same team as the rest of the pipeline:
```
TeamCreate: PM, DEV, SEC, QA, PO
PM → assigns → DEV
DEV → completes → SEC (automatic)
SEC → approves → QA
QA → tests → PO
PO → accepts → User
```

## Severity Levels

### CRITICAL 🔴
- **Definition**: Exploitable vulnerability with high impact (data breach, RCE, auth bypass)
- **Action**: REJECT delivery, must fix immediately
- **Examples**: SQL injection, command injection, auth bypass, hardcoded admin credentials

### HIGH 🟠
- **Definition**: Serious issue with moderate exploitability or impact
- **Action**: REJECT delivery or CONDITIONAL APPROVE with mandatory fix in next release
- **Examples**: XSS, CSRF, insecure session handling, missing rate limiting

### MEDIUM 🟡
- **Definition**: Security weakness that should be addressed but isn't immediately exploitable
- **Action**: CONDITIONAL APPROVE with recommended fix
- **Examples**: Missing input validation, overly broad permissions, verbose errors

### LOW 🟢
- **Definition**: Minor security improvement or best practice
- **Action**: APPROVE with notes for future consideration
- **Examples**: Missing HTTPS-only flag on non-auth cookies, client-side validation only

## Agent Prompt Outline

The `security-reviewer` agent will have these instructions:

```markdown
# Security Reviewer Agent

You are a security specialist reviewing code changes for the BWATS multi-project system.

## Your Role

Review code diffs for security vulnerabilities before QA testing begins. You are the security gate in the delivery pipeline.

## Process

1. Read the task spec from `features/specs/<ID>.md`
2. Get changed files: `git diff origin/dev --name-only`
3. Read each changed file in full
4. Apply the security checklist (see below)
5. Generate findings with severity: CRITICAL/HIGH/MEDIUM/LOW
6. Append security review to `features/delivery/<ID>.md`
7. Recommendation: APPROVE / CONDITIONAL APPROVE / REJECT

## Security Checklist

[Full checklist from above]

## Critical Rules

- NEVER approve code with CRITICAL vulnerabilities
- ALWAYS reject SQL injection, command injection, XSS with user data
- ALWAYS flag hardcoded secrets (even in comments)
- Be thorough but pragmatic — not every theoretical issue is worth blocking

## Report Format

[Template from above]
```

## Acceptance Criteria

### AC1: Security Agent Exists
**Given** the security-reviewer agent is configured
**When** invoked with a task ID
**Then** it reads the task spec and identifies changed files
**And** reviews each file for security issues

### AC2: SQL Injection Detection
**Given** a code change with unsanitized SQL string interpolation
**When** the security agent reviews it
**Then** it flags a CRITICAL finding with line number and recommendation
**And** recommends REJECT

### AC3: Hardcoded Secrets Detection
**Given** a code change with a hardcoded API key
**When** the security agent reviews it
**Then** it flags a CRITICAL finding
**And** recommends moving to `.env`
**And** recommends REJECT

### AC4: XSS Detection
**Given** a React component using `dangerouslySetInnerHTML` with user data
**When** the security agent reviews it
**Then** it flags a HIGH or CRITICAL finding
**And** recommends sanitization or safer alternatives

### AC5: Auth Bypass Detection
**Given** a Xano endpoint without `var.auth_user` check
**When** the security agent reviews it
**Then** it flags a CRITICAL finding
**And** recommends adding authentication

### AC6: Clean Code Approval
**Given** a code change with no security issues
**When** the security agent reviews it
**Then** it generates a report with 0 findings
**And** recommends APPROVE
**And** QA can proceed

### AC7: Conditional Approval
**Given** a code change with only MEDIUM/LOW findings
**When** the security agent reviews it
**Then** it recommends CONDITIONAL APPROVE
**And** lists issues to fix in future release
**And** QA can proceed

### AC8: Integration with PM
**Given** DEV completes implementation
**When** PM receives the completion
**Then** PM invokes security-reviewer before assigning to QA
**And** PM reads the security recommendation
**And** PM only proceeds to QA if APPROVE or CONDITIONAL APPROVE

### AC9: Report in Delivery Log
**Given** the security review completes
**When** the report is written
**Then** it appears in `features/delivery/<ID>.md` under `## SEC: Security Review`
**And** includes date, time, files reviewed, findings, recommendation

### AC10: DEV Feedback Loop
**Given** security review finds CRITICAL issues
**When** the review completes
**Then** PM sends task back to DEV with specific findings
**And** DEV fixes the issues
**And** DEV re-submits for security review
**And** SEC reviews again before allowing QA

### AC11: Self-Audit — .env Exposure Check
**Given** the security agent runs a self-audit
**When** it checks `.claude/settings.local.json`
**Then** it verifies `.env` files are explicitly denied in Read permissions
**And** flags CRITICAL if `.env` files are accessible to agents
**And** recommends adding deny rules

### AC12: Self-Audit — MCP Token Isolation
**Given** the security agent reviews `../bwats_xano/.mcp.json`
**When** it checks token handling
**Then** it verifies `XANO_TOKEN` is loaded from environment variable, not hardcoded
**And** flags CRITICAL if tokens are hardcoded in MCP config
**And** verifies only `backend-developer` agent has access to that directory

### AC13: Self-Audit — Agent Prompt Secrets
**Given** the security agent reviews all agent definition files
**When** it scans `.claude/agents/*.md` and tier-2 prompts
**Then** it searches for patterns like API keys, tokens, passwords
**And** flags CRITICAL if any secrets are found
**And** recommends moving to `.env` or secure environment variables

### AC14: Self-Audit — .gitignore Coverage
**Given** the security agent checks version control hygiene
**When** it reviews all `.gitignore` files across projects
**Then** it verifies `.env`, `.env.*`, `*.pem`, `*.key`, `*secret*` are ignored
**And** flags HIGH if sensitive patterns are missing
**And** recommends adding them to `.gitignore`

### AC15: Self-Audit — Report Generation
**Given** the security agent completes the self-audit
**When** it writes the report
**Then** it includes a "Team Orchestration Security" section
**And** lists all configuration files reviewed
**And** provides PASS/FAIL status for each security check
**And** recommends APPROVE only if all orchestration security checks pass

## Implementation Plan

### Phase 1: Agent Creation
- [ ] Create `.claude/agents/security-reviewer.md` with full instructions
- [ ] Include security checklist (1-9) in agent prompt
- [ ] Include self-audit checklist (category 9) in agent prompt
- [ ] Define report format in agent instructions
- [ ] Test agent on a mock code change with intentional vulnerabilities
- [ ] Test agent self-audit on team orchestration configs

### Phase 2: PM Integration
- [ ] Update `project-manager` agent to invoke security-reviewer after DEV completion
- [ ] Add security gate logic: don't proceed to QA until SEC approves
- [ ] Update PM instructions to read and act on security recommendations

### Phase 3: Testing
- [ ] Test on real task with security issues (e.g., SQL injection, hardcoded secret)
- [ ] Verify SEC catches the issues and recommends REJECT
- [ ] Fix the issues, re-run SEC, verify APPROVE
- [ ] Verify QA only runs after SEC approval

### Phase 4: Documentation
- [ ] Update `CLAUDE.md` to document SEC agent and pipeline position
- [ ] Update `DELIVERY_FORMAT.md` to include SEC review section
- [ ] Update `MEMORY.md` with security review rules
- [ ] Update all developer agent instructions to note security review happens after implementation

### Phase 5: Rollout
- [ ] Run security review on all tasks currently in `dev-complete` status
- [ ] Identify any security issues in existing code
- [ ] Create follow-up tasks to fix identified issues
- [ ] Enable security review for all future tasks

## Dependencies

- `features/DELIVERY_FORMAT.md` (delivery log format)
- `features/BACKLOG.md` (task tracking)
- `features/specs/<ID>.md` (task specifications)
- `.claude/agents/project-manager.md` (must invoke SEC)
- `.claude/agents/` (all developer agents must be aware of SEC gate)

## Testing Plan

### Test 1: SQL Injection Detection
- Create mock function with SQL injection vulnerability
- Run security-reviewer
- Expected: CRITICAL finding, REJECT recommendation

### Test 2: Hardcoded Secret Detection
- Create mock file with `const API_KEY = "sk-abc123"`
- Run security-reviewer
- Expected: CRITICAL finding, REJECT recommendation

### Test 3: XSS Detection
- Create React component with `dangerouslySetInnerHTML` and user data
- Run security-reviewer
- Expected: HIGH or CRITICAL finding, REJECT or CONDITIONAL

### Test 4: Clean Code
- Review a code change with no security issues (e.g., UI styling change)
- Run security-reviewer
- Expected: 0 findings, APPROVE recommendation

### Test 5: End-to-End Pipeline
- Create task with intentional security issue
- PM assigns to DEV
- DEV completes with security issue
- PM invokes SEC
- SEC rejects
- PM sends back to DEV
- DEV fixes
- SEC approves
- QA proceeds

### Test 6: Self-Audit — .env Exposure
- Temporarily remove `.env` deny rules from `.claude/settings.local.json`
- Run security-reviewer self-audit
- Expected: CRITICAL finding, recommendation to add deny rules
- Restore deny rules, re-run
- Expected: PASS

### Test 7: Self-Audit — Hardcoded Token
- Create mock agent with hardcoded token in prompt
- Run security-reviewer self-audit
- Expected: CRITICAL finding, recommendation to move to `.env`

### Test 8: Self-Audit — MCP Config
- Review `../bwats_xano/.mcp.json` for token handling
- Run security-reviewer self-audit
- Expected: PASS (token loaded from env var)

## Future Enhancements

- **Automated static analysis**: Integrate tools like ESLint security plugin, Bandit (Python), semgrep
- **Dependency scanning**: Automated `npm audit`, `pip audit` checks
- **Security regression tests**: Keep a suite of known vulnerabilities to ensure SEC always catches them
- **Learning mode**: SEC updates its own checklist based on vulnerabilities found in production
- **SAST integration**: Connect to GitHub Advanced Security or similar tools
- **Security metrics**: Track vulnerability density over time, time-to-fix for security issues

## Success Metrics

- ✅ 100% of tasks pass security review before reaching QA
- ✅ 0 CRITICAL vulnerabilities deployed to production
- ✅ Security review completes within 5 minutes for typical task
- ✅ False positive rate < 10% (issues flagged that aren't real vulnerabilities)
- ✅ Developer feedback loop: issues fixed within 1 iteration on average

## Related Tasks

- **M8 (Delivery Supervisor)**: Post-delivery compliance check — ensures delivery format is followed. SEC is a content review (security), M8 is a process review (format compliance).
- **W1 (Delivery Workflow)**: Defines the overall pipeline. SEC becomes a mandatory stage in that pipeline.

## Notes

This agent is **preventative** — it catches security issues before they reach QA, before they reach production. It's not a replacement for secure coding practices, but it's a safety net to catch mistakes.

The agent should be pragmatic: not every theoretical issue needs to block delivery. The severity levels guide this — CRITICAL must block, MEDIUM/LOW can proceed with notes.
