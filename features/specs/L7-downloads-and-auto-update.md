# L7: Downloads Section & Extension Auto-Update

**Priority**: Medium
**Type**: BOTH (Frontend + Extension)
**Projects**: nearshore-talent-compass, linked_communication, bw_cold_recruiting

## Summary

Add a "Downloads" section to the ATS dashboard for distributing internal tools (extensions, CLI skills, executables). Include version checking so extensions can notify users when an update is available.

## Part 1: Extension Version Check & Update Notification

### Problem
Chrome extensions installed from local `.zip` files (not the Chrome Web Store) don't auto-update. Users run outdated versions without knowing a new version exists.

### Solution
- Backend endpoint that returns the latest version number and download URL for each tool
- Extension checks this endpoint on startup and periodically
- If local version < server version, show a banner/badge: "Update available (v1.20.4 → v1.21.0) — Download"
- Clicking the banner opens the Downloads page in the ATS

### Items
| Item | Type | Description |
|------|------|-------------|
| `GET /tools/versions` | API endpoint | Returns latest version + download URL for each tool |
| `tools_registry` | DB table | Tool name, current_version, download_url, updated_at |
| Extension version check | EXT | On startup + every 4 hours, check `/tools/versions` and show update banner if outdated |

## Part 2: ATS Downloads Section

### Problem
Internal tools (extensions, CLI skills) are distributed ad-hoc. No central place to find and download them.

### Solution
A `/downloads` page in the ATS dashboard listing all available tools with:
- Tool name, description, current version
- Download button (serves the latest `.zip` or executable)
- Platform/requirements info

### Initial Tools
| Tool | Type | Description |
|------|------|-------------|
| Linked Communication | Chrome Extension | LinkedIn automation companion panel |
| Cold Recruiting | Chrome Extension | Sales outreach extension |
| /ats CLI Skill | Claude Code Skill | Interactive ATS from CLI |

### Items
| Item | Type | Description |
|------|------|-------------|
| `/downloads` page | FRONT | Grid/list of available tools with download buttons |
| Download serving | BACK/INFRA | Serve latest build artifacts (zip files, scripts) |
| Version display | FRONT | Show current version, last updated date |

## Part 3: Build Pipeline Integration (Future)

- On extension build + push, automatically update `tools_registry` with new version
- Could be a git hook or CI step
- Auto-upload dist zip to a serving location

## Acceptance Criteria

- [ ] AC1: Extension checks for updates on startup and shows banner when outdated
- [ ] AC2: `/downloads` page lists all internal tools with download buttons
- [ ] AC3: Backend endpoint returns correct version info for each tool
- [ ] AC4: Clicking "Download" on the page serves the latest build artifact
- [ ] AC5: Extension update banner links to the Downloads page

## Dependencies
- L5 (/ats CLI Skill) — would be listed as a downloadable
- Extension build pipeline — needs to update version registry on build
