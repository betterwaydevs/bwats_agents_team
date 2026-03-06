# QF10 Security Review Report

**Task**: QF10 — Prospect Parser: Local Codex Processing (Zero API Cost)
**Reviewer**: security-reviewer
**Date**: 2026-03-06
**Verdict**: CONDITIONAL APPROVE (1 LOW finding)

---

## Scope

Reviewed the local Python parser service (`prospect_parser/`) and the Xano-side `Add_prospect` endpoint modification.

**Files reviewed**:
- `parser.py` — main entry point, cron + Flask modes
- `parse_core.py` — orchestrates fetch → clean → parse → save pipeline
- `xano_client.py` — HTTP client for 3 Xano APIs (get_for_parsing, save_parsed, mark_parse_status)
- `codex_runner.py` — builds prompt, runs Codex CLI via subprocess
- `html_cleaner.py` — strips scripts/styles/base64, limits to 240KB
- `server.py` — Flask HTTP server (/health, /parse)
- `.env` structure (redacted), `.gitignore`, `requirements.txt`

---

## Checklist Results

| Category | Verdict | Summary |
|----------|---------|---------|
| 1. Auth & Authorization | PASS | All Xano APIs use N8N_WEBHOOK_TOKEN via auth_token param. Token from .env, never hardcoded. |
| 2. Input Validation & Injection | PASS | prospect_id cast to int(). subprocess.run uses list args (no shell=True). Temp files via tempfile. |
| 3. Secrets & Credentials | PASS | .env in .gitignore, not tracked by git. Empty-string default fails closed on Xano side. |
| 4. Data Exposure | PASS | Errors don't leak stack traces. Codex stderr truncated to 500 chars. mark_failed sets status only. |
| 5. Error Handling & Logging | PASS | Bare except Exception is intentional for cron (mark failed, move on). No sensitive data in errors. |
| 6. Rate Limiting & DoS | LOW | Flask /parse endpoint has no auth. See Finding F1. |
| 7. Dependency Security | PASS | 4 pinned deps (flask, requests, python-dotenv, pytest). All well-maintained, no known critical CVEs. |
| 8. XanoScript Patterns | PASS | Add_prospect simplified (removed OpenAI call chain). 3 new APIs use auth_token. Reduced attack surface. |
| 9. Self-Audit | PASS | All 6 production files reviewed. Scope matches what QF10 changed. No files skipped. |

---

## Findings

### F1 — Unauthenticated /parse Flask endpoint

- **Severity**: LOW
- **Category**: 6 (Rate Limiting & DoS)
- **Location**: `server.py:21-31`
- **Description**: The Flask server binds `0.0.0.0:8585` with no authentication on the `/parse` endpoint. Anyone on the network can trigger prospect parsing by hitting `GET /parse`, which consumes Codex compute time.
- **Current mitigation**: Service runs on local/Tailscale network only, not internet-exposed. Cron mode (primary usage) is unaffected.
- **Recommendation**: Add a simple API key check on `/parse` (read from `.env`, compare via header or query param). Not blocking for this release — current network isolation is sufficient.

---

## Verdict

**CONDITIONAL APPROVE** — No blocking issues. One LOW-severity finding (F1) that should be addressed as a future hardening task. The code is clean, secrets are properly managed, and the architecture reduces attack surface compared to the previous OpenAI-based flow.
