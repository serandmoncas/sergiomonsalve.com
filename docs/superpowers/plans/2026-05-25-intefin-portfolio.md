# InteliFin Portfolio Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add InteliFin as a portfolio case study by creating two MDX files (ES + EN) and verifying they render correctly.

**Architecture:** File-based portfolio system — `getAllProjects(locale)` reads `content/portfolio/[locale]/*.mdx`, parses frontmatter with `gray-matter`, and sorts by date. No code changes are needed; creating the MDX files is sufficient.

**Tech Stack:** MDX frontmatter (gray-matter), Next.js App Router, next-intl (es/en)

---

## Files to Create

- `content/portfolio/es/intefin.mdx` — Spanish case study
- `content/portfolio/en/intefin.mdx` — English case study

Screenshot already exists at: `public/portfolio/intefin.png` ✅

---

### Task 1: Create Spanish case study

**Files:**
- Create: `content/portfolio/es/intefin.mdx`

- [ ] **Step 1: Create the Spanish MDX file**

Create `content/portfolio/es/intefin.mdx` with this exact content:

```mdx
---
title: InteliFin
description: SaaS multi-tenant para coaches financieros — diagnósticos digitales, seguimiento de las 4 cuentas y dashboards para clientes. Next.js 15, Supabase, Wompi.
date: "2026-05-22"
role: Founder & Full-Stack Developer
stack: [Next.js 15, TypeScript, Supabase, shadcn/ui, Tailwind CSS, Wompi, Resend]
github: https://github.com/serandmoncas/InteFin
demo: https://intefin.vercel.app
links:
  - label: "Demo"
    url: "https://intefin.vercel.app"
status: active
featured: true
image: /portfolio/intefin.png
---

## El problema

Los coaches financieros son expertos en dinero pero no en herramientas digitales. La práctica típica vive en hojas de cálculo: un Excel por cliente, columnas para cada cuenta, fórmulas que se rompen, archivos que se pierden. El cliente, por su parte, recibe un reporte mensual por WhatsApp que no entiende del todo — y entre sesiones, no tiene forma de ver su progreso.

El problema tiene dos caras: el coach no puede escalar (cada cliente nuevo es más complejidad manual), y el cliente no tiene visibilidad real de su avance. El dinero se convierte en una obligación mensual en lugar de un proyecto con progresión visible.

## La solución

**InteliFin** es una plataforma SaaS multi-tenant que digitaliza la práctica del coaching financiero sin reemplazar al coach — lo potencia.

El corazón del sistema es el método de las **4 cuentas**:

- **Imprevisto** — fondo de emergencia con meta de 1× el ingreso mensual
- **Oxígeno** — colchón de seguridad con meta de 6× el ingreso mensual
- **Retiro** — protección a largo plazo, se activa como meta independiente
- **Inversiones** — se desbloquea solo cuando Imprevisto y Oxígeno superan el 50% de su meta

Esta progresión gamificada transforma el ahorro en un juego con niveles claros: el cliente sabe exactamente en qué etapa está y qué tiene que hacer para avanzar.

**Para el coach:** un panel con todos sus clientes, estado de cada cuenta, net worth agregado y un diagnóstico digital que reemplaza el formulario de primera sesión en papel. El onboarding de cada cliente es una invitación por correo — el cliente llena el diagnóstico, el coach llega a la sesión con los datos ya cargados.

**Para el cliente:** un dashboard personal con health score financiero (0–100), progresión de cada una de las 4 cuentas y evolución mensual del patrimonio neto.

El modelo de negocio es freemium: plan gratuito con hasta 3 clientes activos, plan Pro a $50.000 COP/mes con clientes ilimitados.

## Decisiones técnicas

**Multi-tenancy real con Supabase RLS** — cada coach es un tenant independiente. Todas las tablas incluyen `organization_id` como columna obligatoria, y las políticas de Row-Level Security de PostgreSQL garantizan que ningún coach puede ver datos de otro, incluso si hay un bug en la aplicación. La seguridad está a nivel de base de datos, no solo de API.

**Next.js 15 App Router** — la plataforma tiene tres contextos de navegación distintos: la landing pública, el dashboard del coach (`/coach/*`) y el dashboard del cliente (`/app/*`). El App Router permite server components por defecto en cada contexto, con layouts distintos y autenticación diferenciada. La sesión se resuelve en el servidor y el routing automático (coaches a `/coach/overview`, clientes a `/app/dashboard`) ocurre antes de que el cliente vea la primera pantalla.

**Wompi para pagos en Colombia** — Stripe no es viable para la mayoría de coaches colombianos: requiere cuenta bancaria en USD o EUR y un proceso de verificación complejo. Wompi es la pasarela nativa del mercado colombiano, acepta PSE y tarjetas locales, y la integración ocurre directamente desde Next.js sin servidor intermedio.

**shadcn/ui como sistema de diseño** — velocidad de desarrollo sin sacrificar calidad. Los componentes de shadcn son copiados directamente al repositorio (no instalados como dependencia opaca), lo que significa que se pueden modificar libremente. El tema oscuro definido en CSS variables es coherente en toda la aplicación.

**Resend + React Email** — las invitaciones de onboarding, los magic links de autenticación y las notificaciones de pago son correos transaccionales construidos como componentes React y enviados via Resend. El mismo sistema de componentes del frontend define el diseño de los emails.

## Resultados

MVP lanzado en producción en `intefin.vercel.app`. El sistema cubre el flujo completo: registro del coach, invitación de clientes, diagnóstico financiero digital, actualización mensual de cuentas y cobro del plan Pro.

Lo más interesante del ejercicio fue construir un producto real con un usuario real — no una prueba técnica ni un side project abandonado. Cada decisión de arquitectura (el modelo multi-tenant, la progresión de las 4 cuentas, el modelo freemium) nació de entender el problema de un coach financiero concreto, no de aplicar patrones por defecto.
```

- [ ] **Step 2: Verify the file was created**

```bash
cat content/portfolio/es/intefin.mdx | head -5
```

Expected output (first 5 lines):
```
---
title: InteliFin
description: SaaS multi-tenant para coaches financieros...
date: "2026-05-22"
role: Founder & Full-Stack Developer
```

- [ ] **Step 3: Commit**

```bash
git add content/portfolio/es/intefin.mdx public/portfolio/intefin.png
git commit -m "feat: add InteliFin portfolio case study (ES)"
```

---

### Task 2: Create English case study

**Files:**
- Create: `content/portfolio/en/intefin.mdx`

- [ ] **Step 1: Create the English MDX file**

Create `content/portfolio/en/intefin.mdx` with this exact content:

```mdx
---
title: InteliFin
description: Multi-tenant SaaS for financial coaches — digital diagnostics, 4-account tracking, and client dashboards. Next.js 15, Supabase, Wompi.
date: "2026-05-22"
role: Founder & Full-Stack Developer
stack: [Next.js 15, TypeScript, Supabase, shadcn/ui, Tailwind CSS, Wompi, Resend]
github: https://github.com/serandmoncas/InteFin
demo: https://intefin.vercel.app
links:
  - label: "Demo"
    url: "https://intefin.vercel.app"
status: active
featured: true
image: /portfolio/intefin.png
---

## The problem

Financial coaches are experts in money, not in digital tools. A typical practice lives in spreadsheets: one Excel file per client, columns for each account, formulas that break, files that get lost. The client, in turn, receives a monthly report via WhatsApp they don't fully understand — and between sessions, they have no way to see their own progress.

The problem has two sides: the coach can't scale (each new client adds more manual complexity), and the client has no real visibility into their progress. Money becomes a monthly obligation instead of a project with visible milestones.

## The solution

**InteliFin** is a multi-tenant SaaS platform that digitalizes financial coaching without replacing the coach — it amplifies them.

The heart of the system is the **4-account method**:

- **Imprevisto** (emergency fund) — target of 1× monthly income
- **Oxígeno** (safety net) — target of 6× monthly income
- **Retiro** (retirement/protection) — activated as an independent goal
- **Inversiones** (investments) — unlocked only once Imprevisto and Oxígeno exceed 50% of their targets

This gamified progression transforms saving into a game with clear levels: the client knows exactly what stage they're at and what they need to do to advance.

**For the coach:** a dashboard with all clients, account status, aggregated net worth, and a digital diagnostic that replaces the paper questionnaire from the first session. Onboarding each client is an email invitation — the client fills out the diagnostic, and the coach arrives to the session with the data already loaded.

**For the client:** a personal dashboard with a financial health score (0–100), progress on each of the 4 accounts, and monthly net worth evolution.

The business model is freemium: a free plan for up to 3 active clients, and a Pro plan at $50,000 COP/month with unlimited clients.

## Technical decisions

**True multi-tenancy with Supabase RLS** — each coach is an independent tenant. Every table includes `organization_id` as a mandatory column, and PostgreSQL's Row-Level Security policies guarantee that no coach can access another's data, even if there's a bug in the application. Security lives at the database layer, not just the API layer.

**Next.js 15 App Router** — the platform has three distinct navigation contexts: the public landing page, the coach dashboard (`/coach/*`), and the client dashboard (`/app/*`). The App Router provides server components by default in each context, with separate layouts and differentiated authentication. The session is resolved on the server, and automatic routing (coaches to `/coach/overview`, clients to `/app/dashboard`) happens before the client sees the first screen.

**Wompi for Colombian payments** — Stripe isn't viable for most Colombian coaches: it requires a USD or EUR bank account and a complex verification process. Wompi is the native payment gateway for the Colombian market, accepts PSE and local cards, and integrates directly from Next.js without a middleware server.

**shadcn/ui as design system** — development speed without sacrificing quality. shadcn components are copied directly into the repository (not installed as an opaque dependency), which means they can be freely modified. The dark theme defined in CSS variables is consistent throughout the application.

**Resend + React Email** — onboarding invitations, magic link authentication, and payment notifications are transactional emails built as React components and sent via Resend. The same component system as the frontend defines the email design.

## Results

MVP launched in production at `intefin.vercel.app`. The system covers the complete flow: coach registration, client invitation, digital financial diagnostic, monthly account updates, and Pro plan billing.

The most interesting part of building this was working with a real user on a real problem — not a technical assessment or an abandoned side project. Every architecture decision (the multi-tenant model, the 4-account progression, the freemium model) came from understanding a specific financial coach's problem, not from applying default patterns.
```

- [ ] **Step 2: Verify the file was created**

```bash
cat content/portfolio/en/intefin.mdx | head -5
```

Expected output:
```
---
title: InteliFin
description: Multi-tenant SaaS for financial coaches...
date: "2026-05-22"
role: Founder & Full-Stack Developer
```

- [ ] **Step 3: Commit**

```bash
git add content/portfolio/en/intefin.mdx
git commit -m "feat: add InteliFin portfolio case study (EN)"
```

---

### Task 3: Verify the portfolio renders correctly

**Files:**
- Read: `src/lib/portfolio.ts` (no changes — verification only)

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check portfolio listing page**

Open http://localhost:3000/es/portfolio — verify InteliFin card appears with:
- Screenshot image (16:9 ratio, `intefin.png`)
- Title "InteliFin"
- Stack tags visible
- "active" status badge

- [ ] **Step 3: Check the case study detail page**

Open http://localhost:3000/es/portfolio/intefin — verify:
- Hero image renders
- All 4 sections render (El problema, La solución, Decisiones técnicas, Resultados)
- GitHub link shows in the sidebar
- Demo link shows in the sidebar
- Stack tags show in the sidebar

- [ ] **Step 4: Check English locale**

Open http://localhost:3000/en/portfolio/intefin — verify the English version renders with the correct translated content.

- [ ] **Step 5: Commit spec and plan**

```bash
git add docs/superpowers/
git commit -m "docs: add InteliFin portfolio design spec and implementation plan"
```
