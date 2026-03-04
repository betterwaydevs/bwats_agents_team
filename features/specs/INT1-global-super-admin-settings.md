# INT1: Multi-Tenant Branding — CSS-Based Logo & Colors

**Priority**: Medium
**Type**: FRONT
**Status**: pending
**Simplified approach**: Local CSS files + domain-based config

## Problem

BWATS needs to support multiple tenants (BWATS, Shark Helpers) with different branding (logo, colors) without backend changes. Currently logo and styling are hardcoded.

## Solution Overview

**CSS-based approach** — No database, no settings API, just:
1. Two CSS files in the frontend repo (one per tenant)
2. CSS loads the logo using `background-image: url(...)`
3. A simple config file maps domain → CSS file
4. Frontend loads the correct CSS on startup based on `window.location.hostname`

## Implementation Plan

### 1. Create Two CSS Files

**Location**: `nearshore-talent-compass/src/styles/tenants/`

**File 1**: `bwats.css`
```css
:root {
  /* BWATS colors (current) */
  --brand-primary: #YOUR_CURRENT_PRIMARY;
  --brand-secondary: #YOUR_CURRENT_SECONDARY;
  /* ... other BWATS colors */
}

.tenant-logo {
  background-image: url('/assets/logos/bwats-logo.png');
  width: 150px;
  height: 40px;
  background-size: contain;
  background-repeat: no-repeat;
}
```

**File 2**: `sharkhelpers.css`
```css
:root {
  /* Shark Helpers colors (extracted from https://www.sharkhelpers.com/) */
  --brand-primary: #TBD;
  --brand-secondary: #TBD;
  --brand-accent: #TBD;
  /* ... other Shark Helpers colors */
}

.tenant-logo {
  background-image: url('/assets/logos/sharkhelpers-logo.png');
  width: 150px;
  height: 40px;
  background-size: contain;
  background-repeat: no-repeat;
}
```

### 2. Create Domain Config

**Location**: `nearshore-talent-compass/src/config/tenants.ts`

```typescript
export const TENANT_CONFIG = {
  'bwats.betterway.dev': {
    name: 'bwats',
    cssFile: '/styles/tenants/bwats.css'
  },
  'ats.sharkhelpers.com': {
    name: 'sharkhelpers',
    cssFile: '/styles/tenants/sharkhelpers.css'
  },
  // Default fallback
  'localhost': {
    name: 'bwats',
    cssFile: '/styles/tenants/bwats.css'
  }
};

export function getTenantConfig() {
  const hostname = window.location.hostname;
  return TENANT_CONFIG[hostname] || TENANT_CONFIG['localhost'];
}
```

### 3. Load CSS Dynamically

**Location**: `nearshore-talent-compass/src/main.tsx` (or App.tsx)

Add this at the top of your app initialization:

```typescript
import { getTenantConfig } from './config/tenants';

// Load tenant CSS
const tenantConfig = getTenantConfig();
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = tenantConfig.cssFile;
document.head.appendChild(link);
```

### 4. Use Logo in Components

Replace hardcoded logo `<img>` tags with:

```tsx
<div className="tenant-logo" />
```

The CSS will handle rendering the correct logo.

### 5. Use CSS Variables in Components

Update components to use CSS variables:

```tsx
// Instead of: style={{ color: '#123456' }}
// Use: style={{ color: 'var(--brand-primary)' }}
```

Or in your Tailwind/CSS:
```css
.primary-button {
  background-color: var(--brand-primary);
}
```

## Color Extraction Task

**Subtask**: Visit https://www.sharkhelpers.com/ and extract:
- Primary brand color (main CTA buttons, primary elements)
- Secondary brand color
- Accent colors
- Text colors (headings, body)
- Background colors

Use browser DevTools → Inspect elements → Copy computed color values.

## Files to Modify/Create

| Action | File | Description |
|--------|------|-------------|
| CREATE | `nearshore-talent-compass/src/styles/tenants/bwats.css` | BWATS branding (current colors + logo) |
| CREATE | `nearshore-talent-compass/src/styles/tenants/sharkhelpers.css` | Shark Helpers branding (new colors + logo) |
| CREATE | `nearshore-talent-compass/src/config/tenants.ts` | Domain → CSS mapping |
| CREATE | `nearshore-talent-compass/public/assets/logos/bwats-logo.png` | BWATS logo file |
| CREATE | `nearshore-talent-compass/public/assets/logos/sharkhelpers-logo.png` | Shark Helpers logo file |
| MODIFY | `nearshore-talent-compass/src/main.tsx` | Dynamic CSS loading on app start |
| MODIFY | Components with hardcoded logo | Replace `<img>` with `<div className="tenant-logo" />` |
| MODIFY | Components with hardcoded colors | Use CSS variables: `var(--brand-primary)` |

## Acceptance Criteria

- [ ] **AC1**: When accessing `bwats.betterway.dev`, BWATS logo and colors load
- [ ] **AC2**: When accessing `ats.sharkhelpers.com`, Shark Helpers logo and colors load
- [ ] **AC3**: No backend API calls needed for tenant detection — purely frontend
- [ ] **AC4**: Logo renders via CSS (not `<img src="...">`), scales properly
- [ ] **AC5**: All brand colors use CSS variables (`:root { --brand-* }`)
- [ ] **AC6**: Shark Helpers color palette matches https://www.sharkhelpers.com/
- [ ] **AC7**: localhost defaults to BWATS branding

## Testing

1. **Dev environment**: Test with localhost → should show BWATS
2. **Domain override**: Modify `getTenantConfig()` to force Shark Helpers → verify colors/logo
3. **Visual QA**: Compare Shark Helpers frontend to their website → colors should match

## Dependencies

- Shark Helpers logo file (PNG/SVG) — request from user or extract from their website
- Current BWATS logo file

## Out of Scope

- Backend tenant database or API (not needed for this approach)
- User role-based tenant switching (this is domain-based only)
- Runtime tenant switching (requires page reload to change CSS)

## Notes

This is a **simplified alternative** to the original intern-delegated task. No database, no settings API, no complex architecture — just CSS files and a config object.

If Shark Helpers needs different **functionality** (not just branding), that's a separate task (S1 multi-tenant support).
