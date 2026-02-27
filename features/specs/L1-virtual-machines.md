# L1: Virtual Machines — Kamatera Integration

**Priority**: High (promoted from Low — actively working)
**Type**: BOTH
**Projects**: bwats_xano (API proxy), nearshore-talent-compass (UI)

## Goal
Manage and connect to Kamatera cloud VMs from within the app. Users need to see their machines, turn them on/off, check status, and connect with copy-paste support.

---

## User Stories

1. **As a user**, I can see a list of all our VMs with their current power state (on/off), name, datacenter, CPU, RAM.
2. **As a user**, I can turn a VM on, off, or restart it from the UI.
3. **As a user**, I can see real-time status of a VM (power state, IP address, resource usage).
4. **As a user**, I can connect to a Windows VM via RDP or a web-based client with copy-paste support.
5. **As a user**, I can connect to a Linux VM via VNC/web client with copy-paste support.

---

## Architecture

### Kamatera API (external)
- **Base URL**: `https://console.kamatera.com/service`
- **Auth**: Headers `clientId` + `secret` (stored in Xano env as `kamatera_access_key`, `kamatera_secret`)
- **Key endpoints**:
  - `GET /servers` — List all servers
  - `GET /server/{id}` — Server details (CPU, RAM, disks, networks, power, billing)
  - `PUT /server/{id}/power` — Power on/off/restart (body: `power=on|off|restart`)

### Backend (Xano) — API Proxy
Xano acts as a proxy to Kamatera so the frontend never touches Kamatera credentials directly.

| Endpoint | Method | Description | Kamatera Mapping |
|----------|--------|-------------|------------------|
| `/api:VM_GROUP/servers` | GET | List all VMs | `GET /servers` + detail fetch |
| `/api:VM_GROUP/server/{id}` | GET | Single VM details | `GET /server/{id}` |
| `/api:VM_GROUP/server/{id}/power` | PUT | Power on/off/restart | `PUT /server/{id}/power` |

### Frontend (React)
- New page: `BwatsVirtualMachines.tsx`
- Route: `/virtual-machines`
- Navigation: Add to "Others" dropdown in UserHeader
- Components: VM list table, status badges, power control buttons, connect button

### Connection Options (for copy-paste support)

**Option A — Direct RDP (Windows VMs)**
- Generate `.rdp` file download with the VM's IP pre-filled
- User opens in Microsoft Remote Desktop (native copy-paste)
- Simplest, works immediately, but requires local RDP client

**Option B — Apache Guacamole (web-based, both Windows + Linux)**
- Self-hosted web client that proxies RDP/VNC/SSH in the browser
- Full copy-paste support via clipboard integration
- Runs as a Docker container on our infra
- Frontend embeds Guacamole in an iframe or opens in new tab

**Recommendation**: Start with Option A (RDP file download) for Windows VMs. Plan Guacamole as phase 2 for full web-based access with copy-paste.

---

## Implementation Phases

### Phase 1 — List & Power Control
**Backend tasks:**
- [ ] Create new API group in Xano for VM management
- [ ] `GET /servers` — calls Kamatera `GET /servers`, enriches each with detail from `GET /server/{id}`
- [ ] `GET /server/{id}` — proxy to Kamatera server detail
- [ ] `PUT /server/{id}/power` — proxy power control (validate `power` param is on/off/restart)
- [ ] Auth: require BWATS user auth token (reuse existing middleware)

**Frontend tasks:**
- [ ] Create `BwatsVirtualMachines.tsx` page
- [ ] Add route `/virtual-machines` in App.tsx (ProtectedRoute + FullAccessRoute)
- [ ] Add "Virtual Machines" to otherItems in UserHeader.tsx (Monitor icon)
- [ ] VM list table: name, datacenter, power status (badge: green/red), CPU, RAM, IP
- [ ] Power buttons: Start / Stop / Restart with confirmation dialog
- [ ] Loading skeletons and error states
- [ ] Auto-refresh status every 30s (or after power action)

### Phase 2 — Connect (RDP file download)
- [ ] Backend: `GET /server/{id}/connect` — returns connection info (IP, port, protocol)
- [ ] Frontend: "Connect" button generates and downloads `.rdp` file
- [ ] Pre-fill IP, username; user enters password

### Phase 3 — Web Client (Guacamole) — Future
- [ ] Deploy Apache Guacamole container
- [ ] Configure Guacamole connections per VM
- [ ] Frontend: "Connect in Browser" opens Guacamole session
- [ ] Clipboard sharing for copy-paste

---

## Acceptance Criteria

### Phase 1
- [ ] User sees table of all Kamatera VMs with name, datacenter, status, CPU, RAM
- [ ] Power status shown as colored badge (green=on, red=off)
- [ ] User can start/stop/restart a VM; UI updates after action
- [ ] Kamatera credentials never exposed to frontend
- [ ] Requires BWATS authentication

### Phase 2
- [ ] "Connect" button downloads `.rdp` file with correct IP
- [ ] User can open RDP file in Microsoft Remote Desktop and connect
- [ ] Copy-paste works natively through RDP

---

## Kamatera API Reference

### Authentication
All requests need these headers:
```
Content-Type: application/json
clientId: <kamatera_access_key>
secret: <kamatera_secret>
```

### List Servers
```
GET /servers
→ [{ id, datacenter, name, power }]
```

### Server Details
```
GET /server/{id}
→ { id, name, datacenter, cpu, ram, disks, networks, power, billing, backup }
```

### Power Control
```
PUT /server/{id}/power
Content-Type: application/x-www-form-urlencoded
Body: power=on|off|restart
→ Task ID
```

Note: Power operations return a task ID (async). May need polling or just optimistic UI update.

---

## Dependencies
- Kamatera credentials already in Xano env (`kamatera_access_key`, `kamatera_secret`)
- No new infrastructure needed for Phase 1-2
- Phase 3 (Guacamole) needs a Docker host
