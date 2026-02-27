# L1: Virtual Machines — Progress Log

## 2026-02-27 — Session 3: COMPLETE (Phase 1 + Phase 2)

### Status: Done

### What was built

**Backend (Xano) — API group `virtual_machines` (canonical: `6esnlNbi`):**
- `GET /servers` (ID: 43107) — Lists all Kamatera VMs, enriched with CPU, RAM, IP from detail calls
- `GET /server/{server_id}` (ID: 43108) — Single VM details
- `PUT /server/{server_id}/power` (ID: 43109) — Power on/off/restart
- All endpoints require BWATS JWT auth
- Auth headers: `AuthClientId` + `AuthSecret` (NOT `clientId`/`secret` as originally spec'd)
- Kamatera credentials from Xano env vars: `kamatera_access_key`, `kamatera_secret`

**Frontend (nearshore-talent-compass):**
- `src/services/virtualMachineApi.ts` — API service
- `src/apps/bwats/pages/BwatsVirtualMachines.tsx` — Full page with:
  - VM table: name, status badge (green/red), datacenter, CPU, RAM, IP
  - Power controls: Start/Stop/Restart with confirmation dialogs
  - RDP download button: generates `.rdp` file with VM IP, clipboard redirection enabled
  - Auto-refresh every 30s, loading skeletons, error states
- Route: `/virtual-machines` (ProtectedRoute + FullAccessRoute)
- Nav: "Virtual Machines" in Others dropdown (Monitor icon)
- API key: `virtualMachines: '6esnlNbi'` in apiEndpoints.ts

### Verified working
- `GET /servers` returns enriched data (2 VMs: pablo-linkedin, pablolinkedin-1)
- MCP canCreate confirmed working with new token
- TypeScript compiles clean, Vite build passes

### Commits
| Repo | Hash | Description |
|------|------|-------------|
| nearshore-talent-compass | e4e3cea | Add Virtual Machines page (frontend Phase 1) |
| nearshore-talent-compass | c11f926 | Wire VM page to Xano API group canonical |
| nearshore-talent-compass | e39217d | Add RDP file download button |
| bwats_xano | f208d49 | Add virtual_machines API group |
| bwats_xano | 3d18bee | Fix Kamatera auth headers + unwrap response |
| bwats_xano | 2e1ad3b | Enrich VM list with CPU, RAM, IP |

### Discoveries
- Kamatera auth headers are `AuthClientId`/`AuthSecret`, not `clientId`/`secret`
- Kamatera has IP whitelisting — Xano server IP must be allowed
- MCP SSE transport may return "Invalid token" — use Streamable HTTP (`/stream`) as workaround
- Xano `api.request` response wraps in `{ headers, result, status }` — use `.response.result` to unwrap
