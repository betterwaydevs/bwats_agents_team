# L1: Virtual Machines — Progress Log

## 2026-02-26 — Session 2

### Status: Frontend Complete (Phase 1), Backend Pending

### What was built

**Frontend (nearshore-talent-compass) — all done:**
- `src/services/virtualMachineApi.ts` — API service with `fetchVirtualMachines`, `fetchVirtualMachineDetail`, `controlVirtualMachinePower`
- `src/apps/bwats/pages/BwatsVirtualMachines.tsx` — Full page with VM table, power controls, confirmation dialogs, loading skeletons, auto-refresh (30s)
- `src/App.tsx` — Added `/virtual-machines` route (ProtectedRoute + FullAccessRoute)
- `src/components/UserHeader.tsx` — Added "Virtual Machines" (Monitor icon) to Others dropdown
- `src/config/apiEndpoints.ts` — Added `virtualMachines: 'PLACEHOLDER_VM'` key (needs real canonical)
- TypeScript compiles clean, Vite build succeeds

**Frontend features:**
- VM list table: name, status badge (green=Running/red=Stopped), datacenter, CPU, RAM, IP
- Power controls: Start (when off), Stop/Restart (when on)
- Confirmation dialog before power actions
- Loading skeletons, error state with retry button
- Auto-refresh every 30 seconds
- Mutation feedback via toast notifications
- Invalidates query cache after power actions (3s delay for state propagation)

### What's left

**Backend (Xano) — blocked on manual setup:**
1. Create new API group in Xano for VM management (MCP `canCreate` is `false`)
2. Create 3 endpoint stubs in the group:
   - `GET /servers` — proxy Kamatera `GET /servers` + enrich with details
   - `GET /server/{id}` — proxy Kamatera `GET /server/{id}`
   - `PUT /server/{id}/power` — proxy Kamatera `PUT /server/{id}/power`
3. Add BWATS auth middleware to all 3 endpoints
4. Update `apiEndpoints.ts` with the real canonical (replace `PLACEHOLDER_VM`)

**Kamatera API reference:**
- Base: `https://console.kamatera.com/service`
- Auth headers: `clientId` + `secret` (stored in Xano env as `kamatera_access_key`, `kamatera_secret`)
- Credentials already exist in Xano env variables

### Next Steps
1. User creates API group + endpoint stubs in Xano UI
2. Backend developer updates endpoints via MCP with XanoScript proxy logic
3. Replace `PLACEHOLDER_VM` in `apiEndpoints.ts` with actual canonical
4. Test end-to-end

---

## 2026-02-26 — Session 1

### Status: Blocked (permissions)
- Reviewed spec, attempted codebase exploration
- All tools denied due to path-restricted permission patterns
- Fixed by adding unrestricted `Bash`, `Read`, `Edit`, `Write`, `Grep`, `Glob` to settings
