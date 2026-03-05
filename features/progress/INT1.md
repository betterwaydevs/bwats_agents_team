# INT1: Multi-Tenant Branding — Progress Log

## 2026-03-05 — Kickoff

### Status
- Task moved from `pending` to `in-progress` in `features/BACKLOG.md`.
- PM assignment started for INT1 with priority on local dev testing for Shark subdomain/domain logic.

### Context Read
- `features/specs/INT1-global-super-admin-settings.md`
- `features/specs/S1-shark-helpers-multi-tenant.md`

### User Direction
- INT1 should be wrapped up first.
- Immediate focus: add a reliable local development way to test Shark subdomain logic before full S1 rollout.

### Execution Started
- DEV (frontend) delegated to implement tenant/domain resolution and a local override test path in `nearshore-talent-compass`.
- Target outcome: developers can verify Shark tenant behavior locally without production DNS changes.

### Open Items
- Confirm final local testing mechanism (hostname mapping via hosts file vs explicit runtime/env override) based on implementation constraints.
- Complete SEC, QA, and PO gates after DEV submission.

## 2026-03-05 — DEV Blocker

### Status
- DEV stage moved to `blocked` in delivery log.

### Blocker Detail
- Workspace sandbox allows writes only under `/home/pablo/projects/bwats/team` and `/tmp`.
- Required implementation files are in `../nearshore-talent-compass/`, which is currently read-only from this session.
- Frontend agent produced a concrete diff plan but could not apply changes or run `npm run build`.

### Next Step
- Apply prepared patch directly in `nearshore-talent-compass` (outside this sandbox), then resume pipeline with SEC -> QA -> PO.

## 2026-03-05 — Unblocked / DEV Resumed

### Status
- Write access is now available for `nearshore-talent-compass`.
- DEV stage resumed to implement tenant resolver + local Shark override test path.

### Current Focus
- Centralize hostname/app detection in one resolver.
- Enable local testing on `localhost` via query param override without changing production routing behavior.

## 2026-03-05 — DEV Completed

### Implemented
- Added `nearshore-talent-compass/src/config/tenants.ts` with centralized tenant resolution:
  - domain mapping for BWATS/jobs/Shark hosts
  - localhost-only query override: `?tenant=sharkhelpers`, `?tenant=bwats`, `?tenant=reset`
  - persisted localhost override in localStorage
- Updated `nearshore-talent-compass/src/config/environment.ts` to consume centralized resolver (`getCurrentApp`, tenant metadata).
- Updated `nearshore-talent-compass/src/App.tsx` to remove hardcoded jobs-host check and use resolver-based app detection.

### Verification
- Build succeeded in nearshore project: `npm run build` completed with no errors.
- Existing bundle-size and dynamic import warnings are pre-existing and non-blocking for INT1 scope.

### Next
- Move to SEC review, then QA functional validation of local tenant override scenarios.

## 2026-03-05 — SEC Issue + Fix

### Security Finding
- SEC found a medium risk: tenant override could be triggered on non-loopback host (`100.114.78.113`) due localhost classification in resolver.

### Fix Applied
- Updated `nearshore-talent-compass/src/config/tenants.ts`:
  - Removed non-loopback IP from localhost set.
  - Enforced local override only when `import.meta.env.DEV && isLocalhost`.

### Verification
- Rebuilt frontend successfully: `npm run build`.
- SEC re-check approved with no remaining findings in scope.

## 2026-03-05 — Local Subdomain Support for Mini PC

### Requirement Update
- User requested host-file based local dev domains instead of localhost-only testing.
- Target domains: `bwats.betterway.local` and `ats.sharkelpers.local` (plus standard `sharkhelpers` spelling for safety).

### Changes Applied
- Updated resolver defaults in `nearshore-talent-compass/src/config/tenants.ts`:
  - BWATS domains include `bwats.betterway.local`
  - Shark domains include both:
    - `ats.sharkhelpers.local`, `sharkhelpers.local`
    - `ats.sharkelpers.local`, `sharkelpers.local`
- Updated `nearshore-talent-compass/vite.config.ts`:
  - `server.allowedHosts` includes local test hostnames
  - CORS origin regex includes `*.betterway.local`, `*.sharkhelpers.local`, `*.sharkelpers.local`

### Verification
- Build re-run passed: `npm run build`.

## 2026-03-05 — Tenant Color Theme Applied

### Changes Applied
- Added startup tenant theme application:
  - `nearshore-talent-compass/src/config/theme.ts`
  - `nearshore-talent-compass/src/main.tsx` calls `applyTenantTheme()`
- Added Shark-specific CSS variable overrides in:
  - `nearshore-talent-compass/src/index.css`
  - Overrides include `--primary`, `--accent`, `--ring`, and sidebar variables for both light/dark.

### Result
- Subdomain tenant detection now has visible color differentiation:
  - BWATS keeps teal palette
  - Shark uses blue/orange-accented palette

### Verification
- `npm run build` passed after theme changes.

## 2026-03-05 — Shark Brand Logo + Color Alignment

### Update
- User requested Shark branding from `https://www.sharkhelpers.com/`.
- Updated authenticated header logo to switch by tenant:
  - Shark tenant uses Shark logo asset URL from SharkHelpers site CDN.
  - BWATS keeps BetterWay logo.
- Updated Shark light-theme accent color to orange (`#ff9014`) to align with Shark brand palette.

### Files
- `nearshore-talent-compass/src/components/UserHeader.tsx`
- `nearshore-talent-compass/src/index.css`

### Verification
- `npm run build` passed after branding update.

## 2026-03-05 — Tenant Branding Config (Meta + Title + Favicon)

### Request
- User requested per-tenant title/meta tags and shark favicon handling via config.

### Changes
- Added centralized branding config:
  - `nearshore-talent-compass/src/config/branding.ts`
  - Includes per-tenant: `displayName`, `logoUrl`, `faviconUrl`, `title`, `description`, `themeColor`
- Updated `nearshore-talent-compass/src/config/theme.ts`:
  - Applies tenant favicon from branding config
  - Applies tenant meta tags and document title on startup (`description`, `theme-color`, `og:title`, `og:description`, `og:site_name`, `twitter:title`, `twitter:description`)
- Updated `nearshore-talent-compass/src/components/UserHeader.tsx`:
  - Uses branding config for header logo/alt text
- Updated shark palette in `nearshore-talent-compass/src/index.css` to orange-first styling.

### Note
- Direct file download from external CDN is blocked in this sandbox, so shark logo/favicon are configured via their remote URLs in branding config.

### Verification
- Build passed: `npm run build`.

## 2026-03-05 — Commit + Completion

### Commit
- Nearshore frontend changes committed:
  - `nearshore-talent-compass@9b59d05`
  - Message: `INT1: add tenant domain/branding switch for BWATS and Shark`

### Push Status
- Push to `origin/main` could not be completed from this environment due restricted network DNS resolution to GitHub (`Could not resolve host: github.com`).

### Final Task Status
- Delivery pipeline marked complete through QA, PO, and User approval.
- `features/BACKLOG.md` updated: `INT1` set to `done`.
