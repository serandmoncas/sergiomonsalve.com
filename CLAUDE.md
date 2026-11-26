# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server at http://localhost:3000
npm run build        # production build
npm run lint         # ESLint
npm test             # run tests in watch mode (Vitest)
npm run test:run     # run tests once (CI mode)
```

## Deployment

Pushes to `main` on GitHub (`serandmoncas/sergiomonsalve.com`) trigger Vercel production deploys automatically.
Live at `https://sergiomonsalve.com` (A record → `76.76.21.21`).

## Architecture

Next.js 16.2.4 App Router with `src/` directory layout. All routes are nested under `src/app/[locale]/` for path-based i18n (`/es`, `/en`). The root `src/app/layout.tsx` is a pass-through; `src/app/[locale]/layout.tsx` renders the full `<html>/<body>` structure with `NextIntlClientProvider`, `Nav`, and `Footer`.

**i18n:** `next-intl` via `src/i18n/routing.ts` (locales: `['es', 'en']`, default: `es`). All copy lives in `src/messages/es.json` and `src/messages/en.json`. Use `useTranslations()` in components; use `t.raw()` for array values. Type-safe navigation via `src/i18n/navigation.ts` — import `Link`, `useRouter`, `usePathname` from there, not from `next/navigation`.

**Middleware:** `src/proxy.ts` (Next.js 16 uses `proxy.ts` + exports `proxy` function, not `middleware`). Composes two concerns:
- **Auth guard:** checks Supabase session on `[locale]/admin/*` paths (except `/admin/login`) and on `/es/manual-de-usuario/{mapa,n,r,grafo}` (portada y `/entrar` son públicas; `/en/...` redirige a `/es/...`) — redirects to login if unauthenticated. `/admin` also requires the email to be in `ADMIN_EMAILS` (`isAdminEmail` in `src/lib/auth/admin.ts`, also checked in `/api/admin/*`)
- **Diario (DI-083):** `/[locale]/admin/diario/*` además exige segundo factor (TOTP de Supabase, nivel `aal2`); sin él, redirige a `/[locale]/admin/diario/segundo-factor?next=…` (registra el autenticador o pide el código; `destinoDiario` limita `next` al diario). Las respuestas llevan `CABECERAS_DIARIO` (`private, no-store`, `noindex, nofollow`). La página `/admin/diario` vuelve a comprobar con `requireAdminAal2`.
- **Locale routing:** all other paths go through next-intl's `createMiddleware`

**Database:** Supabase (`orlniujfwolyinsuezcu`, us-west-2). Tables:
- `contact_submissions` — contact form entries
- `profiles` — admin user role (FK → auth.users)
- `comments` — blog post comments; `approved=false` by default, admin must approve

Server-side queries use `createAdminClient()` from `src/lib/supabase/server.ts` (service role, bypasses RLS). Auth-aware server client uses `createClient()` from the same file (cookie-based session). Browser client in `src/lib/supabase/client.ts` is used in client components for auth (magic link).

**Auth:** Supabase magic link. Login at `/[locale]/admin/login`. After clicking the link, `/auth/callback` exchanges the code for a session and redirects to `/[locale]/admin/comments`. Admins are the emails listed in `ADMIN_EMAILS` (comma-separated; required for `/admin` and `/api/admin/*`); any Supabase session is not enough. No public signup.

**API routes:**
- `POST /api/contact` — contact form (Zod-validated, Supabase insert, Resend email)
- `POST /api/comments` — public comment submission (Zod-validated with honeypot, saves as unapproved)
- `GET /api/admin/comments` — all comments for admin (admin-gated via `ADMIN_EMAILS`)
- `PATCH /api/admin/comments/[id]` — approve a comment (admin-gated via `ADMIN_EMAILS`)
- `DELETE /api/admin/comments/[id]` — delete a comment (admin-gated via `ADMIN_EMAILS`)
- `GET /api/admin/diario/estado` — prueba del diario. Todo `/api/admin/diario/*` usa `requireAdminAal2`: responde 404 sin cuerpo si no hay sesión de admin en `aal2` (o si Supabase falla).

**Manual de Usuario (privado, por invitación):** el contenido vive en el repo privado `serandmoncas/manual-de-usuario` y se lee con la API de GitHub; este sitio solo lo muestra.
- Env vars: `MANUAL_GITHUB_TOKEN` (solo Production; fine-grained, solo lectura sobre ese repo), `ADMIN_EMAILS`, `ADMIN_NAME`. Sin token, la página dice "No disponible…".
- Rutas: `[locale]/(main)/manual-de-usuario/` (portada y `entrar` públicas; `(lector)/` mapa, `n/[slug]`, `r/[recorrido]`, `grafo`), `api/manual/comments`, admin en `[locale]/(main)/admin/manual` y `api/admin/manual/*`. Libs en `src/lib/manual/`.
- Acceso: el proxy exige sesión; cada página de `(lector)` llama a `getManualForReader()`. Nunca usar `getManual()` directo en páginas de lector.
- Regla: **ningún texto del manual en este repo** (los tests usan fixtures inventados).
- La migración `supabase/migrations/008_manual.sql` se aplica a mano en Supabase.
- Para entrar con enlace mágico, la URL de `/auth/callback` debe estar en las redirect URLs de Supabase (ver abajo).

**Email:** Resend sends from `noreply@sergiomonsalve.com` (domain verified 2026-06-02).

**Content (MDX):** File-based via `gray-matter` + `next-mdx-remote/rsc`. Two content types:
- `content/blog/[locale]/YYYY-MM-DD-slug.mdx` — blog posts (frontmatter: title, date, description, tags)
- `content/recipes/[locale]/YYYY-MM-DD-slug.mdx` — recipes (frontmatter: title, date, description, tags, servings, time, ingredients[])

Lib functions in `src/lib/posts.ts` and `src/lib/recipes.ts`. MDX rendered via `src/components/MDXContent.tsx` which registers the `<Step number={N}>` custom component. Prose styles live in `.mdx-prose` class in `src/app/globals.css`.

**Testing:** Vitest + React Testing Library. Tests co-located in `__tests__/` folders next to the files they test. Mock `next-intl` with `vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))` in component tests. Use `vi.hoisted()` when mock factory closures reference variables in the same module scope.

**Design system:** Tailwind CSS v4 with tokens defined in `src/app/globals.css` under `@theme`. Key tokens: `bg-background` (#0f0f0f), `text-accent` (#00ff88), `bg-surface` (#1a1a1a), `text-text-secondary` (#888), `font-mono` (JetBrains Mono).

## Supabase auth setup (required in dashboard)

Add these redirect URLs at supabase.com → Authentication → URL Configuration:
- `https://sergiomonsalve.com/auth/callback**`
- `http://localhost:3000/auth/callback**`

El `**` final es obligatorio: sin él Supabase descarta el `?next=…` y el enlace mágico cae en `/es/admin/login?error=auth` (verificado 2026-11-25).

## Segundo factor del diario: recuperación

Registrar dos autenticadores (celular y Mac) desde `/admin/diario` → "Registrar otro autenticador". Si se pierden los dos, borrar el factor en Supabase → Authentication → Users → el usuario → MFA factors; el siguiente ingreso pide registrar uno nuevo.
