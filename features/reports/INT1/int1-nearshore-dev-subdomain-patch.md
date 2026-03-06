# INT1 Patch Draft — Local Shark Subdomain Testing

Apply these changes in `../nearshore-talent-compass`.

## 1) Create `src/config/tenants.ts`

```ts
export type AppContext = 'bwats' | 'jobs';
export type Tenant = 'bwats' | 'sharkhelpers';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '100.114.78.113']);
const TENANT_OVERRIDE_STORAGE_KEY = 'LOCAL_TENANT_OVERRIDE';

const JOBS_DOMAINS = (import.meta.env.VITE_JOBS_DOMAINS || 'jobs.betterway.dev,jobs.atlanticsoft.us')
  .split(',')
  .map((d: string) => d.trim())
  .filter(Boolean);

const SHARK_DOMAINS = (import.meta.env.VITE_SHARK_DOMAINS || 'ats.sharkhelpers.com,app.sharkhelpers.com')
  .split(',')
  .map((d: string) => d.trim())
  .filter(Boolean);

const matchesDomain = (hostname: string, domain: string): boolean => {
  return hostname === domain || hostname.endsWith(`.${domain}`) || hostname.includes(domain);
};

const isLocalHost = (hostname: string): boolean => {
  return LOCAL_HOSTS.has(hostname);
};

const asTenant = (value: string | null): Tenant | null => {
  if (value === 'bwats' || value === 'sharkhelpers') return value;
  return null;
};

export const getTenantFromHostname = (hostname = window.location.hostname): Tenant => {
  if (SHARK_DOMAINS.some((domain: string) => matchesDomain(hostname, domain)) || hostname.includes('sharkhelpers')) {
    return 'sharkhelpers';
  }

  return 'bwats';
};

export const getTenant = (): Tenant => {
  const hostname = window.location.hostname;
  const fromEnv = asTenant(import.meta.env.VITE_LOCAL_TENANT_OVERRIDE || null);

  if (isLocalHost(hostname)) {
    if (fromEnv) return fromEnv;

    const fromStorage = asTenant(localStorage.getItem(TENANT_OVERRIDE_STORAGE_KEY));
    if (fromStorage) return fromStorage;
  }

  return getTenantFromHostname(hostname);
};

export const getAppContext = (hostname = window.location.hostname): AppContext => {
  if (JOBS_DOMAINS.some((domain: string) => matchesDomain(hostname, domain))) {
    return 'jobs';
  }

  return 'bwats';
};

export const bootstrapLocalTenantOverrideFromQuery = (): void => {
  if (typeof window === 'undefined') return;

  const hostname = window.location.hostname;
  if (!isLocalHost(hostname)) return;

  const url = new URL(window.location.href);
  const tenantParam = url.searchParams.get('tenant');

  if (!tenantParam) return;

  if (tenantParam === 'clear') {
    localStorage.removeItem(TENANT_OVERRIDE_STORAGE_KEY);
  } else {
    const parsed = asTenant(tenantParam);
    if (parsed) {
      localStorage.setItem(TENANT_OVERRIDE_STORAGE_KEY, parsed);
    }
  }

  url.searchParams.delete('tenant');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
};
```

## 2) Update `src/config/environment.ts`

Replace app-detection section with import from `tenants.ts`:

```ts
import { getAppContext, getTenant, type AppContext } from './tenants';

export type Environment = 'development' | 'live';
export type { AppContext };

// Tenant identifier from env (legacy var kept for compatibility)
export const TENANT = import.meta.env.VITE_TENANT || getTenant();

// Detect current app based on routing
export const getCurrentApp = (): AppContext => {
  return getAppContext();
};
```

And in `logEnvironmentInfo()` add:

```ts
const tenant = getTenant();
```

Then add `tenant` into logged object.

## 3) Update `src/main.tsx`

```ts
import { logEnvironmentInfo } from '@/config/environment';
import { bootstrapLocalTenantOverrideFromQuery } from '@/config/tenants';

bootstrapLocalTenantOverrideFromQuery();
logEnvironmentInfo();
```

## 4) Update `src/App.tsx`

- Add import:

```ts
import { getCurrentApp } from '@/config/environment';
```

- Remove helper:

```ts
// Helper to detect Jobs subdomain
const isJobsSubdomain = () => {
  const hostname = window.location.hostname;
  return hostname.includes('jobs.betterway.dev') || hostname.includes('jobs.atlanticsoft.us');
};
```

- Replace:

```ts
const isJobs = isJobsSubdomain();
```

with:

```ts
const isJobs = getCurrentApp() === 'jobs';
```

## 5) Local Dev Validation

- Start app normally on localhost.
- Test BWATS default: `http://localhost:8080/`.
- Force Shark tenant locally: `http://localhost:8080/?tenant=sharkhelpers`.
- Clear override: `http://localhost:8080/?tenant=clear`.
- Optional env override for local runs:
  - `VITE_LOCAL_TENANT_OVERRIDE=sharkhelpers npm run dev`

## 6) Build Check

```bash
npm run build
```
