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
- **Auth guard:** checks Supabase session on `[locale]/admin/*` paths (except `/admin/login`) — redirects to login if unauthenticated
- **Locale routing:** all other paths go through next-intl's `createMiddleware`

**Database:** Supabase (`orlniujfwolyinsuezcu`, us-west-2). Tables:
- `contact_submissions` — contact form entries
- `profiles` — admin user role (FK → auth.users)
- `comments` — blog post comments; `approved=false` by default, admin must approve

Server-side queries use `createAdminClient()` from `src/lib/supabase/server.ts` (service role, bypasses RLS). Auth-aware server client uses `createClient()` from the same file (cookie-based session). Browser client in `src/lib/supabase/client.ts` is used in client components for auth (magic link).

**Auth:** Supabase magic link. Login at `/[locale]/admin/login`. After clicking the link, `/auth/callback` exchanges the code for a session and redirects to `/[locale]/admin/comments`. Only one admin account (Sergio). No public signup.

**API routes:**
- `POST /api/contact` — contact form (Zod-validated, Supabase insert, Resend email)
- `POST /api/comments` — public comment submission (Zod-validated with honeypot, saves as unapproved)
- `GET /api/admin/comments` — all comments for admin (auth-gated)
- `PATCH /api/admin/comments/[id]` — approve a comment (auth-gated)
- `DELETE /api/admin/comments/[id]` — delete a comment (auth-gated)

**Email:** Resend sends from `noreply@sergiomonsalve.com` (domain verified 2026-06-02).

**Content (MDX):** File-based via `gray-matter` + `next-mdx-remote/rsc`. Two content types:
- `content/blog/[locale]/YYYY-MM-DD-slug.mdx` — blog posts (frontmatter: title, date, description, tags)
- `content/recipes/[locale]/YYYY-MM-DD-slug.mdx` — recipes (frontmatter: title, date, description, tags, servings, time, ingredients[])

Lib functions in `src/lib/posts.ts` and `src/lib/recipes.ts`. MDX rendered via `src/components/MDXContent.tsx` which registers the `<Step number={N}>` custom component. Prose styles live in `.mdx-prose` class in `src/app/globals.css`.

**Testing:** Vitest + React Testing Library. Tests co-located in `__tests__/` folders next to the files they test. Mock `next-intl` with `vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))` in component tests. Use `vi.hoisted()` when mock factory closures reference variables in the same module scope.

**Design system:** Tailwind CSS v4 with tokens defined in `src/app/globals.css` under `@theme`. Key tokens: `bg-background` (#0f0f0f), `text-accent` (#00ff88), `bg-surface` (#1a1a1a), `text-text-secondary` (#888), `font-mono` (JetBrains Mono).

## Supabase auth setup (required in dashboard)

Add these redirect URLs at supabase.com → Authentication → URL Configuration:
- `https://sergiomonsalve.com/auth/callback`
- `http://localhost:3000/auth/callback`

