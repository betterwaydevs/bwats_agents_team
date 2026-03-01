# S3: Sales Outreach Campaign (V1)

**Priority**: High
**Type**: BOTH
**Projects**: bwats_xano, nearshore-talent-compass

## Problem

No automated outreach system exists. Cold outreach to potential hiring companies is manual. Need a 6-step email drip campaign that maintains top-of-mind awareness with funded companies, using AI-generated personalized copy.

## Overview

Build a campaign engine that:
1. Takes contact lists from Apollo (CSV)
2. Scrapes company websites for context
3. Generates personalized 6-step email sequences per contact
4. Outputs enriched CSV with generated copy ready for sending

## Campaign Design

**Audience**: Funded B2B SaaS, Fintech, HealthTech, PropTech, AI companies. Roles: CTO, VP Engineering, Head of Engineering, HR/Recruiting.

**Tone**: Neutral, informative, no-pressure. Never claim the company is hiring. No sales language or CTAs.

### 6-Step Sequence

| Step | Day | Angle | Link |
|------|-----|-------|------|
| 1 | 0 | Expansion planning & execution questions | candidates.betterway.dev |
| 2 | +4 | Bilingual / cross-region collaboration | betterway.dev/posts/hiring-south-america |
| 3 | +9 | Nearshore as execution model (timezone alignment) | betterway.dev/posts/nearshore-development |
| 4 | +14 | Transparency as collaboration enabler | betterway.dev/posts/transparent-staffing |
| 5 | +21 | Regional team continuity over one-off staffing | betterway.dev/posts/scaling-it-teams |
| 6 | +30 | Soft loop closure, re-share roles directory | candidates.betterway.dev |

### Email Format Rules

- HTML with `<br><br>` between paragraphs, no wrapper tags
- Short length — nobody reads long cold emails
- Subject: 3-7 words, lowercase style, no clickbait, no emojis
- Sign off: Just "Pablo" — no title, no company name, no links
- Personalization: first name + company name naturally, not forced
- Never use "I hope this email finds you well"

### Company Context Builder

From scraped website + Apollo data, generate a `company_context_line`:
- Format: `"[verb]ing a/an [description] [product type]"`
- Examples: "building an AI-driven fintech platform", "developing SaaS for real estate"

### Relevance Angles

| ID | Label | When to use |
|----|-------|-------------|
| scaling_team | Scaling the team | Company growing or building product |
| cost_efficiency | Cost efficiency | Could benefit from quality talent at lower cost |
| latam_expertise | LATAM expertise | Domain has strong LATAM talent pool |
| timezone_collaboration | Timezone alignment | Values real-time collaboration |
| future_hiring | Future hiring | General awareness |

## Output Fields Per Contact

Added to Apollo CSV columns:
- `company_website`, `site_summary`, `site_keywords`
- `company_context_line`, `relevance_angle`
- `subject1` through `subject6`
- `email1` through `email6`

## Acceptance Criteria

- [ ] AC1: Pipeline takes Apollo CSV input and outputs enriched CSV with generated emails
- [ ] AC2: Company website scraped and `company_context_line` generated per contact
- [ ] AC3: 6 personalized email subjects + bodies generated per contact
- [ ] AC4: All emails follow format rules (short, HTML, no sales language)
- [ ] AC5: No email claims the company is hiring or uses pushy CTAs
- [ ] AC6: Each step uses only its allowed links
- [ ] AC7: Subject lines are 3-7 words, lowercase style

## References

- Full campaign spec: `/home/pablo/projects/sales/campaign.md`
- Sales project CLAUDE.md: `/home/pablo/projects/sales/CLAUDE.md`
- Date: 2026-01-26
