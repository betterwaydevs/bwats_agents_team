# S1: Shark Helpers — Multi-Tenant Support & Deployment

**Priority**: High
**Type**: BOTH (all projects)
**Projects**: bwats_xano, nearshore-talent-compass, resume_parser, bw_cold_recruiting, linked_communication

## Problem

BWATS has hardcoded URLs, API keys, index names, and domain references scattered across ~30 files in 5 services. Before provisioning Shark Helpers (or any future tenant), all services must become configurable via a centralized settings layer.

## Overview

Two phases:
1. **Phase 1 — Dynamic Config Refactoring**: Make every service read from a config/settings layer while preserving current BWATS behavior as defaults. Zero downtime, independently testable per step.
2. **Phase 2 — Shark Helpers Provisioning**: Duplicate BWATS for Shark Helpers with full tenant isolation — separate Xano workspace, ES indices, frontend deployment, Chrome extensions.

## Phase 1: Dynamic Config Refactoring (6 Steps)

Source: `sharkats/dynamic_config_plan.pdf`

### Step 1 — Python ETL: Create `config.py` & Update Scripts

**Create** `resume_parser/config.py`:
- `TENANT`, `ENVIRONMENT` from env vars (defaults: `bwats`, `prod`)
- `XANO_BASE_URL` (default: `https://xano.atlanticsoft.co`)
- `XANO_MANATAL_API_KEY`, `XANO_CANDIDATES_API_KEY`, `XANO_PROSPECTS_API_KEY`
- Composed URLs: `XANO_MANATAL_URL`, `XANO_PARSED_CANDIDATE_URL`, `XANO_PARSED_PROSPECT_URL`
- `ELASTICSEARCH_URL`, `CANDIDATES_INDEX`, `PROSPECTS_INDEX`
- `APOLLO_API_KEY`, `MANATAL_API_KEY`

**Modify** 6 scripts to import from `config.py`:
- `send_to_xano.py` → `XANO_MANATAL_URL`
- `index_candidates.py` → `XANO_PARSED_CANDIDATE_URL`, `CANDIDATES_INDEX`
- `sync_apollo_to_es.py` → `APOLLO_API_KEY`
- `backup_elastic_index.py` → `PROSPECTS_INDEX`
- `sync_es_notes_to_xano.py` → `PROSPECTS_INDEX`, `XANO_PARSED_PROSPECT_URL`
- `find_orphan_prospects.py` → `PROSPECTS_INDEX`, `XANO_PARSED_PROSPECT_URL`

**Verify**: `python -c "from config import *; print(XANO_MANATAL_URL, CANDIDATES_INDEX)"`

### Step 2 — Frontend: Vite Env Vars for Base URL & Domains

**Modify** `apiEndpoints.ts`:
```ts
const BASE_URL = import.meta.env.VITE_XANO_BASE_URL || 'https://xano.atlanticsoft.co';
```

**Modify** `environment.ts`:
- `TENANT` via `VITE_TENANT`
- `JOBS_DOMAINS` from `VITE_JOBS_DOMAINS` (comma-separated)
- `EXTRA_DEV_DOMAINS` from `VITE_DEV_DOMAINS`
- `getCurrentApp()` reads domain list from env

**Modify** `vite.config.ts`: CORS origins from `VITE_CORS_ORIGINS`, fallback to current list

**Create** `.env.example` with all VITE_ vars and BWATS defaults

**Verify**: `npm run dev` with no `.env` → works as today

### Step 3 — Chrome Extension: bw_cold_recruiting Build-Time Config

**Strategy**: Use `__PLACEHOLDER__` tokens in source code. `build_extension.py` replaces at build time from `tenant_configs/{tenant}.json`.

**Create** `tenant_configs/bwats.json` with: `XANO_BASE_URL`, `AUTH_API_KEY`, `PROSPECTS_API_KEY`, `TASKS_API_KEY`, `LINKEDIN_API_KEY`, `N8N_WEBHOOK_URL`, `APP_DOMAIN`

**Replace** hardcoded values with tokens in: `AuthManager.js`, `xano-api.js`, `AutoCaptureManager.js`, `UnparsedProspectManager.js`

**Modify** `build_extension.py`: add `--tenant` flag, load config, replace tokens

**Verify**: `python build_extension.py --tenant bwats` → load unpacked → login + capture work

### Step 4 — Chrome Extension: linked_communication Build-Time Config

**Create** `tenant_configs/bwats.json` with: `XANO_BASE_URL`, `AUTH_API_KEY`, `LINKEDIN_API_KEY`, `TASKS_API_KEY`, `PROJECTS_API_KEY`, `ERRORS_API_KEY`, `APP_DOMAIN`

**Replace** hardcoded values in: `XanoClient.js` (10 DEFAULT_* consts), `sidepanel.js`, `background.js`

**Modify** `build_extension.py`: same `--tenant` pattern

**Verify**: `python build_extension.py --tenant bwats` → side panel works

### Step 5 — Xano: Make ES Index Names Configurable

**Modify** `search_candidates_in_es.xs` (ID 2370):
```
index: ($env.es_candidates_index ?? "candidates")
```

**Modify** `search_prospects_in_es.xs` (ID 2371):
```
index: ($env.es_prospects_index ?? "prospects")
```

**Action**: Add env vars `es_candidates_index = "candidates"` and `es_prospects_index = "prospects"` in Xano UI

**Verify**: Candidate + prospect search → results unchanged

### Step 6 — Python ETL: Create `.env.example`

**Create** `resume_parser/.env.example` with all config vars and BWATS defaults

## Phase 2: Shark Helpers Provisioning

Source: `sharkats/plan_sharkhelpers.md` (full detail)

High-level steps:
1. Provision new Xano workspace for Shark Helpers
2. Create separate ES indices (`sh_candidates`, `sh_prospects`)
3. Deploy frontend with Shark Helpers config (different domain, VITE_ vars)
4. Build Chrome extensions with `--tenant sharkhelpers`
5. Configure resume_parser with Shark Helpers `.env`
6. Set up separate email domain + Resend webhooks
7. Full E2E verification

## Files Changed (Phase 1)

| Action | File |
|--------|------|
| CREATE | `resume_parser/config.py` |
| CREATE | `resume_parser/.env.example` |
| CREATE | `nearshore-talent-compass/.env.example` |
| CREATE | `bw_cold_recruiting/tenant_configs/bwats.json` |
| CREATE | `linked_communication/tenant_configs/bwats.json` |
| MODIFY | `resume_parser/send_to_xano.py` |
| MODIFY | `resume_parser/index_candidates.py` |
| MODIFY | `resume_parser/sync_apollo_to_es.py` |
| MODIFY | `resume_parser/backup_elastic_index.py` |
| MODIFY | `resume_parser/sync_es_notes_to_xano.py` |
| MODIFY | `resume_parser/find_orphan_prospects.py` |
| MODIFY | `nearshore-talent-compass/.../apiEndpoints.ts` |
| MODIFY | `nearshore-talent-compass/.../environment.ts` |
| MODIFY | `nearshore-talent-compass/vite.config.ts` |
| MODIFY | `bw_cold_recruiting/.../AuthManager.js` |
| MODIFY | `bw_cold_recruiting/xano-api.js` |
| MODIFY | `bw_cold_recruiting/.../AutoCaptureManager.js` |
| MODIFY | `bw_cold_recruiting/.../UnparsedProspectManager.js` |
| MODIFY | `bw_cold_recruiting/build_extension.py` |
| MODIFY | `linked_communication/.../XanoClient.js` |
| MODIFY | `linked_communication/.../sidepanel.js` |
| MODIFY | `linked_communication/.../background.js` |
| MODIFY | `linked_communication/build_extension.py` |
| MODIFY | `bwats_xano/.../search_candidates_in_es.xs` |
| MODIFY | `bwats_xano/.../search_prospects_in_es.xs` |

## Acceptance Criteria (Phase 1)

- [ ] AC1: Python ETL — `from config import *` prints BWATS defaults
- [ ] AC2: Frontend — `npm run dev` with no `.env` works as today
- [ ] AC3: bw_cold_recruiting — `build_extension.py --tenant bwats` → login + capture work
- [ ] AC4: linked_communication — `build_extension.py --tenant bwats` → side panel works
- [ ] AC5: Xano — candidate + prospect search returns unchanged results
- [ ] AC6: Override test — `VITE_XANO_BASE_URL=https://different.url` → frontend builds with new URL
- [ ] AC7: No BWATS regression — all services work identically to pre-refactoring

## References

- Dynamic config plan: `sharkats/dynamic_config_plan.pdf`
- Full multi-tenant plan: `sharkats/plan_sharkhelpers.md`
