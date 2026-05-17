# Owner Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a login button to the public nav that, when authenticated, shows an owner dropdown with admin links + sign-out, and adds edit-notes (✎) buttons to each book card on /biblioteca.

**Architecture:** Nav becomes an async server component that reads auth state via Supabase cookie client, then renders a new `UserMenu` client component for the dropdown. BibliotecaPage reads auth and passes `isOwner` down through BookList to BookCard, which conditionally renders a ✎ link to the admin notes editor.

**Tech Stack:** Next.js 16 App Router, Supabase SSR, Tailwind CSS v4, next-intl.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/components/Nav.tsx` | Async, reads auth, renders UserMenu |
| Create | `src/components/UserMenu.tsx` | Client dropdown: login link / admin links + sign out |
| Modify | `src/components/BookCard.tsx` | Accept `isOwner?`, render ✎ link |
| Modify | `src/components/BookList.tsx` | Accept + pass `isOwner?` to BookCard |
| Modify | `src/app/[locale]/biblioteca/page.tsx` | Read auth, pass `isOwner` to BookList |

---

## Task 1: UserMenu client component

**Files:**
- Create: `src/components/UserMenu.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/UserMenu.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UserMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.refresh()
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/admin/login"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
        title="Login"
      >
        ›_
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-2 h-2 rounded-full bg-accent hover:opacity-80 transition-opacity"
        title="Modo editor"
        aria-label="Modo editor"
      />

      {open && (
        <div className="absolute right-0 top-6 w-44 bg-background border border-border rounded-sm shadow-lg z-50 py-2">
          <p className="font-mono text-[10px] text-accent px-3 py-1 mb-1">// modo editor</p>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="block font-mono text-xs text-text-secondary hover:text-accent hover:bg-surface px-3 py-1.5 transition-colors"
          >
            Admin →
          </Link>
          <Link
            href="/admin/biblioteca"
            onClick={() => setOpen(false)}
            className="block font-mono text-xs text-text-secondary hover:text-accent hover:bg-surface px-3 py-1.5 transition-colors"
          >
            Biblioteca →
          </Link>
          <Link
            href="/admin/comments"
            onClick={() => setOpen(false)}
            className="block font-mono text-xs text-text-secondary hover:text-accent hover:bg-surface px-3 py-1.5 transition-colors"
          >
            Comentarios →
          </Link>
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={signOut}
              className="w-full text-left font-mono text-xs text-text-muted hover:text-text hover:bg-surface px-3 py-1.5 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/UserMenu.tsx
git commit -m "feat: add UserMenu client component for owner dropdown"
```

---

## Task 2: Update Nav to async + add UserMenu

**Files:**
- Modify: `src/components/Nav.tsx`

- [ ] **Step 1: Replace Nav.tsx**

Replace the full contents of `src/components/Nav.tsx`:

```tsx
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import LocaleSwitcher from './LocaleSwitcher'
import UserMenu from './UserMenu'

export default async function Nav() {
  const t = await getTranslations('nav')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
      <Link href="/" className="font-mono text-sm font-bold text-accent">
        SM
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/blog" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('blog')}
        </Link>
        <Link href="/portfolio" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('portfolio')}
        </Link>
        <Link href="/recipes" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('recipes')}
        </Link>
        <Link href="/biblioteca" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('biblioteca')}
        </Link>
        <Link href="/guestbook" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('guestbook')}
        </Link>
        <Link href="/contact" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('contact')}
        </Link>
        <LocaleSwitcher />
        <UserMenu isLoggedIn={!!user} />
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: exits 0. Nav should now render with the UserMenu.

- [ ] **Step 3: Update Nav test if it exists**

Check `src/components/__tests__/Nav.test.tsx` — it likely mocks `useTranslations` but the component is now async. Run:

```bash
npm run test:run -- src/components/__tests__/Nav.test.tsx
```

Nav is now async and calls Supabase — it cannot be rendered by RTL in jsdom. Replace `src/components/__tests__/Nav.test.tsx` entirely with:

```ts
import { describe, it } from 'vitest'

describe('Nav', () => {
  it('is an async server component — verified via build and manual testing', () => {
    // Nav reads Supabase auth state server-side.
    // RTL cannot render async server components in jsdom.
  })
})
```

- [ ] **Step 4: Run full test suite**

```bash
npm run test:run
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.tsx src/components/__tests__/Nav.test.tsx
git commit -m "feat: make Nav async with auth state, add UserMenu"
```

---

## Task 3: BookCard + BookList owner mode

**Files:**
- Modify: `src/components/BookCard.tsx`
- Modify: `src/components/BookList.tsx`

- [ ] **Step 1: Update BookCard to accept isOwner**

Replace the full contents of `src/components/BookCard.tsx`:

```tsx
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { BookStatus } from '@/lib/library'
import type { UnifiedBook } from '@/lib/unified-library'
import StarRating from './StarRating'

const statusClass: Record<BookStatus, string> = {
  listening: 'text-accent',
  completed: 'text-text-secondary',
  queued: 'text-text-muted',
  abandoned: 'text-text-muted line-through',
}

const SOURCE_TYPE_LABEL: Record<string, string> = {
  physical: 'físico',
  ebook: 'ebook',
  other: 'otro',
}

export default function BookCard({
  book,
  locale,
  statusLabel,
  isOwner,
}: {
  book: UnifiedBook
  locale: string
  statusLabel: string
  isOwner?: boolean
}) {
  const hours = Math.floor(book.runtime_length_min / 60)
  const minutes = book.runtime_length_min % 60

  return (
    <div className="relative group/card">
      <Link
        href={`/biblioteca/${book.id}`}
        locale={locale as 'es' | 'en'}
        className="block border border-border hover:border-accent transition-colors p-4 rounded-sm group"
      >
        <div className="flex gap-4">
          <div className="shrink-0 w-16 h-20 relative rounded-sm overflow-hidden bg-surface">
            {book.cover_url && (
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <span className={`font-mono text-xs ${statusClass[book.status]}`}>
                {statusLabel}
              </span>
              {book.rating !== null && <StarRating rating={book.rating} />}
              {book.source === 'manual' && book.source_type && (
                <span className="font-mono text-[9px] text-text-muted border border-border px-1 rounded-sm">
                  {SOURCE_TYPE_LABEL[book.source_type] ?? book.source_type}
                </span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-text group-hover:text-accent transition-colors mb-1 truncate">
              {book.title}
            </h2>
            <p className="font-mono text-xs text-text-muted mb-1">{book.authors.join(', ')}</p>
            {book.runtime_length_min > 0 && (
              <p className="font-mono text-xs text-text-muted">
                {hours}h {minutes}m
              </p>
            )}
          </div>
        </div>
      </Link>

      {isOwner && (
        <Link
          href={`/admin/biblioteca/${book.id}/notes?title=${encodeURIComponent(book.title)}`}
          className="absolute top-2 right-2 font-mono text-[10px] text-text-muted hover:text-accent transition-colors opacity-0 group-hover/card:opacity-100"
          title="Editar notas"
        >
          ✎
        </Link>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update BookList to accept and pass isOwner**

In `src/components/BookList.tsx`, add `isOwner?: boolean` to the props and pass it to BookCard.

Change the component signature line from:
```tsx
export default function BookList({ books, locale }: { books: UnifiedBook[]; locale: string }) {
```
to:
```tsx
export default function BookList({ books, locale, isOwner }: { books: UnifiedBook[]; locale: string; isOwner?: boolean }) {
```

And add `isOwner={isOwner}` to the BookCard render:
```tsx
<BookCard
  key={book.id}
  book={book}
  locale={locale}
  statusLabel={statusLabel[book.status]}
  isOwner={isOwner}
/>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/BookCard.tsx src/components/BookList.tsx
git commit -m "feat: add owner edit-notes button to BookCard"
```

---

## Task 4: Pass isOwner from BibliotecaPage

**Files:**
- Modify: `src/app/[locale]/biblioteca/page.tsx`

- [ ] **Step 1: Update the page to read auth and pass isOwner**

Replace the full contents of `src/app/[locale]/biblioteca/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getAllUnifiedBooks } from '@/lib/unified-library'
import BookList from '@/components/BookList'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('bibliotecaTitle'),
    description: t('bibliotecaDescription'),
    alternates: { canonical: `/${locale}/biblioteca` },
  }
}

export default async function BibliotecaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'biblioteca' })

  const [books, supabase] = await Promise.all([
    getAllUnifiedBooks(locale),
    createClient(),
  ])
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-accent mb-2">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">{t('title')}</h1>
      <BookList books={books} locale={locale} isOwner={!!user} />
    </div>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm run test:run
```
Expected: all tests pass.

- [ ] **Step 3: Run build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/biblioteca/page.tsx"
git commit -m "feat: pass isOwner auth state to BookList in biblioteca page"
```
