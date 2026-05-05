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

GitHub → Vercel auto-deploy is not triggering. Always deploy manually:

```bash
npx vercel --prod --yes
```

## Architecture

Next.js 16.2.4 App Router with `src/` directory layout. All routes are nested under `src/app/[locale]/` for path-based i18n (`/es`, `/en`). The root `src/app/layout.tsx` is a pass-through; `src/app/[locale]/layout.tsx` renders the full `<html>/<body>` structure with `NextIntlClientProvider`, `Nav`, and `Footer`.

**i18n:** `next-intl` via `src/i18n/routing.ts` (locales: `['es', 'en']`, default: `es`). All copy lives in `src/messages/es.json` and `src/messages/en.json`. Use `useTranslations()` in components; use `t.raw()` for array values. Type-safe navigation via `src/i18n/navigation.ts` — import `Link`, `useRouter`, `usePathname` from there, not from `next/navigation`.

**Middleware:** `src/proxy.ts` (Next.js 16 uses `proxy.ts` instead of `middleware.ts`). Handles locale routing via next-intl.

**Database:** Supabase. Server-side queries use `createAdminClient()` from `src/lib/supabase/server.ts` (service role key, bypasses RLS). Browser client in `src/lib/supabase/client.ts` is wired for future auth use. Table: `contact_submissions`.

**API:** `src/app/api/contact/route.ts` is the only API route in v1. Input validated with Zod schema from `src/lib/contact-schema.ts` before touching the DB. Email sent via `src/lib/resend.ts` (best-effort — failure does not block the response).

**Email:** Resend sends from `onboarding@resend.dev` temporarily (domain `sergiomonsalve.com` pending full DNS verification in Resend). Once all 4 Resend DNS checks are green, revert `src/lib/resend.ts` line 7 to `from: 'Sergio Monsalve <noreply@sergiomonsalve.com>'`.

**Testing:** Vitest + React Testing Library. Tests co-located in `__tests__/` folders next to the files they test. Mock `next-intl` with `vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))` in component tests. Use `vi.hoisted()` when mock factory closures reference variables in the same module scope.

**Design system:** Tailwind CSS v4 with tokens defined in `src/app/globals.css` under `@theme`. Key tokens: `bg-background` (#0f0f0f), `text-accent` (#00ff88), `bg-surface` (#1a1a1a), `text-text-secondary` (#888), `font-mono` (JetBrains Mono).

## Known issues

- `/favicon.ico` returns 404 — favicon not yet added to `public/`
- GitHub → Vercel auto-deploy not working — use `npx vercel --prod --yes`
- Resend emails land in spam until domain is fully verified (see Email section above)
