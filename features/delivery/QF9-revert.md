# QF9 Revert: Delivery Log

## DEV: Extension
- **Status**: done
- **Agent**: chrome-ext-developer
- **Date**: 2026-03-03
- **Notes**: Reverted QF9 fire-and-forget changes. The QF9 modifications were uncommitted working tree changes (never committed), so revert was done via `git restore` on all 5 affected files: background.js, content-capture.js, popup.js, sidepanel.js, manifest.json. Extension is back to v1.20.4 (the last committed version). Sequential save patterns restored in all callers. popup.js and sidepanel.js verified consistent.
- **Commits**: No new commits needed — changes were uncommitted and simply discarded.
