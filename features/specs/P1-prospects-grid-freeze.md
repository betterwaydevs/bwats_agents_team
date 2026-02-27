# P1: Prospects Grid Freezing After Actions

**Priority**: High
**Type**: FRONT
**Project**: nearshore-talent-compass

## Problem
Frontend grid freezes after any action (stage move, task complete) and data refresh. Users can't click checkboxes. Backend touchpoints already optimized (limited to 5 per person, 94% payload reduction) — freeze persists.

## Tasks
- [ ] Profile with Chrome DevTools — identify long tasks during refresh
- [ ] Check if grid re-renders all rows vs surgical update
- [ ] Check for race conditions (multiple API calls after action)
- [ ] Check checkbox state loss during re-render

## Acceptance Criteria
- Grid remains interactive after stage moves and task completions
- No visible freeze or unresponsive checkboxes after data refresh
- Actions complete without requiring page reload

## Dependencies
None — backend optimization already done.
