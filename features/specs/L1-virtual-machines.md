# L1: Virtual Machines / RDP Section

**Priority**: Low
**Type**: FRONT
**Projects**: bwats_xano, nearshore-talent-compass

## Problem
No way to manage or connect to remote VMs from the app.

## Tasks
- [ ] Create `virtual_machine` table + CRUD API
- [ ] Frontend: VM list with status, "Connect" button

## Acceptance Criteria
- Users can see a list of VMs with their status
- "Connect" button opens RDP connection (or Guacamole in future)
- CRUD operations work for admin users
