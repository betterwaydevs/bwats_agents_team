# L6: CLI Token Page — Browser-based Auth for /ats

## Summary
A simple frontend page at `/cli-token` that displays the current user's auth token with a copy button. Used by the `/ats` CLI skill for passwordless authentication.

## Requirements

### Page: `/cli-token`
1. If user is **not logged in**: show login form (reuse existing auth flow)
2. If user is **logged in**: show:
   - User name and email (confirmation of who's logged in)
   - The auth token in a read-only text field (masked by default)
   - A "Show/Hide" toggle for the token
   - A "Copy to Clipboard" button with success feedback
   - Instructions: "Paste this token into your `/ats` CLI session"
3. No navigation chrome needed — this is a utility page
4. Token comes from `localStorage.getItem('authToken')` (same as existing auth)

### Acceptance Criteria
- [ ] Page renders at `https://bwats.betterway.dev/cli-token`
- [ ] Login redirects back to `/cli-token` after auth
- [ ] Token displays correctly and copy button works
- [ ] Page is accessible but not linked from main navigation (utility page)

## Tech Stack
- React/TypeScript (same as rest of frontend)
- shadcn/ui components (Button, Input, Card)
- Existing AuthContext for token access

## Estimate
Quick fix — ~30 min for frontend-developer
