# L2: Prerender / SEO Meta Tags

**Priority**: Low
**Type**: FRONT/INFRA
**Project**: nearshore-talent-compass

## Problem
Public pages shared on social media lack proper Open Graph tags.

## Tasks
- [ ] Choose approach: prerender.io / Lambda@Edge / static generation
- [ ] API for meta tag data per page
- [ ] Configure crawler detection

## Execution Notes (2026-03-06)

**Assessment**: Small scope but needs an architectural decision before implementation. The frontend is a React/Vite SPA — crawlers won't execute JS, so static `index.html` meta tags only work for a single generic preview.

**Options to evaluate**:
1. **Static meta tags in `index.html`** — Simplest. One generic preview for all shared links. No per-page customization. Good enough if only the landing page is shared publicly.
2. **Prerender.io (or similar SaaS)** — Middleware that serves pre-rendered HTML to crawlers. Per-page OG tags with zero code changes. Costs money (~$15-50/mo). Needs server/CDN config to route crawler traffic.
3. **Lambda@Edge / Cloudflare Worker** — Custom function at the CDN layer that injects meta tags for crawlers based on URL. More control, more setup. Good if already on AWS CloudFront or Cloudflare.
4. **SSR/SSG migration** — Overkill for just OG tags. Not recommended unless SSR is wanted for other reasons.

**Decision needed from Pablo**: Which pages are actually shared publicly? If it's just the main landing page, option 1 is a 15-minute task. If job postings or candidate profiles are shared, we need option 2 or 3.

**Agent needed**: frontend-developer (+ infra setup depending on option chosen).

## Acceptance Criteria
- Social media previews show correct title, description, and image
- Crawler detection works for major platforms (Facebook, LinkedIn, Twitter)
