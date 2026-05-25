# Design: InteliFin — Portfolio Case Study

**Date:** 2026-05-25  
**Status:** Approved

## Summary

Add InteliFin (https://github.com/serandmoncas/InteFin) to the portfolio as a founder-built product case study. Two MDX files (ES + EN) following the existing pattern. Screenshot already captured at `public/portfolio/intefin.png`.

## Frontmatter

```yaml
title: InteliFin
date: "2026-05-22"
role: Founder & Full-Stack Developer
stack: [Next.js 15, TypeScript, Supabase, shadcn/ui, Tailwind CSS, Wompi, Resend]
github: https://github.com/serandmoncas/InteFin
demo: https://intefin.vercel.app
status: active
featured: true
image: /portfolio/intefin.png
```

- **ES description:** SaaS multi-tenant para coaches financieros — diagnósticos digitales, seguimiento de las 4 cuentas y dashboards para clientes. Next.js 15, Supabase, Wompi.
- **EN description:** Multi-tenant SaaS for financial coaches — digital diagnostics, 4-account tracking, and client dashboards. Next.js 15, Supabase, Wompi.

## Case Study Sections (Hybrid: product + technical)

1. **El problema / The problem** — Financial coaches manage clients via scattered Excel files; clients have zero visibility into their own progress.
2. **La solución / The solution** — InteliFin digitalizes the practice: the 4-account system (Imprevisto, Oxígeno, Retiro, Inversiones), email-invitation onboarding, client dashboard with health score (0–100) and net worth tracking, coach dashboard with full client overview.
3. **Decisiones técnicas / Technical decisions** — True multi-tenancy via `organization_id` on every table + Supabase RLS; Next.js 15 App Router with magic-link auth; Wompi for Colombian payment processing ($50,000 COP/month Pro plan); shadcn/ui for rapid, consistent UI; Resend + React Email for transactional emails.
4. **Resultados / Results** — MVP live in production at intefin.vercel.app; first coach onboarded; freemium model validated.

## Files to Create

- `content/portfolio/es/intefin.mdx`
- `content/portfolio/en/intefin.mdx`

## Files Already Done

- `public/portfolio/intefin.png` ✅
