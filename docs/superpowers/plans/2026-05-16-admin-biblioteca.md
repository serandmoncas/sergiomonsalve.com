# Admin Biblioteca Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `/admin/biblioteca` section that lets Sergio toggle book visibility and set reading status in real-time via Supabase, reflected immediately on the public `/biblioteca` page.

**Architecture:** A sparse `library_books` Supabase table stores only modified books (absent row = visible, status=queued). A pure `applyBookOverrides` function in `library.ts` merges overrides onto the static book list. The public page fetches overrides server-side; the admin page uses client-side fetch + optimistic UI, following the existing comments page pattern.

**Tech Stack:** Next.js 16 App Router, Supabase (service role), Zod, Tailwind CSS v4, Vitest.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/lib/library.ts` | Add `BookOverride` type + `applyBookOverrides` function |
| Modify | `src/lib/__tests__/library.test.ts` | Add 4 tests for `applyBookOverrides` |
| Create | `src/app/api/admin/biblioteca/route.ts` | GET — merged book list for admin |
| Create | `src/app/api/admin/biblioteca/[asin]/route.ts` | PATCH — upsert visibility/status |
| Create | `src/app/[locale]/admin/biblioteca/page.tsx` | Admin client page with toggles |
| Modify | `src/app/[locale]/biblioteca/page.tsx` | Apply Supabase overrides before rendering |
| Modify | `src/components/admin/AdminSidebar.tsx` | Add Biblioteca nav item |
| Modify | `src/app/[locale]/admin/page.tsx` | Add books hidden stat card |

---

## Task 1: applyBookOverrides in library.ts (TDD)

**Files:**
- Modify: `src/lib/library.ts`
- Modify: `src/lib/__tests__/library.test.ts`

- [ ] **Step 1: Write failing tests**

Add to the bottom of `src/lib/__tests__/library.test.ts` (after the existing `getBookAsins` describe block):

```ts
// ── applyBookOverrides ──────────────────────────────────────────────────────

function makeBookMeta(asin: string, status: BookStatus = 'queued'): BookMeta {
  return {
    asin,
    title: `Book ${asin}`,
    authors: ['Author'],
    narrators: ['Narrator'],
    cover_url: '',
    runtime_length_min: 300,
    purchase_date: '2024-01-01',
    percent_complete: 0,
    publisher_summary: '',
    status,
    rating: null,
  }
}

describe('applyBookOverrides', () => {
  it('returns all books unchanged when overrides is empty', () => {
    const books = [makeBookMeta('B001'), makeBookMeta('B002')]
    expect(applyBookOverrides(books, [])).toHaveLength(2)
  })

  it('excludes books with visible=false', () => {
    const books = [makeBookMeta('B001'), makeBookMeta('B002')]
    const overrides: BookOverride[] = [{ asin: 'B001', visible: false, status: 'queued' }]
    const result = applyBookOverrides(books, overrides)
    expect(result).toHaveLength(1)
    expect(result[0].asin).toBe('B002')
  })

  it('overrides status from Supabase row', () => {
    const books = [makeBookMeta('B001', 'queued')]
    const overrides: BookOverride[] = [{ asin: 'B001', visible: true, status: 'completed' }]
    expect(applyBookOverrides(books, overrides)[0].status).toBe('completed')
  })

  it('keeps original status when no override exists for a book', () => {
    const books = [makeBookMeta('B001', 'listening')]
    expect(applyBookOverrides(books, [])[0].status).toBe('listening')
  })
})
```

Also update the import on line 3 to include the new exports:
```ts
import { getAllBooks, getBook, getBookAsins, applyBookOverrides, type BookOverride, type BookMeta, type BookStatus } from '../library'
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm run test:run -- src/lib/__tests__/library.test.ts
```
Expected: FAIL — `applyBookOverrides is not exported`

- [ ] **Step 3: Add BookOverride type and applyBookOverrides to library.ts**

Add immediately after the `Book` type definition (after line `content: string | null`):

```ts
export type BookOverride = {
  asin: string
  visible: boolean
  status: BookStatus
}

export function applyBookOverrides(books: BookMeta[], overrides: BookOverride[]): BookMeta[] {
  const map = new Map(overrides.map(o => [o.asin, o]))
  return books
    .map(b => {
      const o = map.get(b.asin)
      return o ? { ...b, status: o.status } : b
    })
    .filter(b => {
      const o = map.get(b.asin)
      return o ? o.visible : true
    })
}
```

- [ ] **Step 4: Run tests — confirm all 15 pass**

```bash
npm run test:run -- src/lib/__tests__/library.test.ts
```
Expected: 15 tests PASS (11 existing + 4 new).

- [ ] **Step 5: Commit**

```bash
git add src/lib/library.ts src/lib/__tests__/library.test.ts
git commit -m "feat: add applyBookOverrides with tests"
```

---

## Task 2: Create Supabase table

**This is a manual step — run the SQL in the Supabase dashboard.**

- [ ] **Step 1: Open Supabase SQL editor**

Go to https://supabase.com → project `orlniujfwolyinsuezcu` → SQL Editor → New query.

- [ ] **Step 2: Run the migration SQL**

```sql
CREATE TABLE library_books (
  asin        TEXT PRIMARY KEY,
  visible     BOOLEAN NOT NULL DEFAULT TRUE,
  status      TEXT    NOT NULL DEFAULT 'queued',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Click Run. Expected: `Success. No rows returned`.

- [ ] **Step 3: Verify the table exists**

In the Supabase Table Editor, confirm `library_books` appears with the 4 columns.

No commit needed — this is infrastructure, not code.

---

## Task 3: GET /api/admin/biblioteca

**Files:**
- Create: `src/app/api/admin/biblioteca/route.ts`

- [ ] **Step 1: Create the route file**

Create `src/app/api/admin/biblioteca/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getAllBooks } from '@/lib/library'
import type { BookStatus } from '@/lib/library'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: rows, error } = await admin
    .from('library_books')
    .select('asin, visible, status')
  if (error) return NextResponse.json({ error: 'Failed to fetch overrides' }, { status: 500 })

  const overrideMap = new Map((rows ?? []).map(r => [r.asin, r]))
  const books = getAllBooks('es').map(book => {
    const o = overrideMap.get(book.asin)
    return {
      asin: book.asin,
      title: book.title,
      authors: book.authors,
      cover_url: book.cover_url,
      runtime_length_min: book.runtime_length_min,
      visible: o ? Boolean(o.visible) : true,
      status: o ? (o.status as BookStatus) : book.status,
    }
  })

  return NextResponse.json({ books })
}
```

- [ ] **Step 2: Verify build compiles cleanly**

```bash
npm run build
```
Expected: exits 0, `/api/admin/biblioteca` appears in output.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/biblioteca/route.ts
git commit -m "feat: add GET /api/admin/biblioteca"
```

---

## Task 4: PATCH /api/admin/biblioteca/[asin]

**Files:**
- Create: `src/app/api/admin/biblioteca/[asin]/route.ts`

- [ ] **Step 1: Create the route file**

Create `src/app/api/admin/biblioteca/[asin]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  visible: z.boolean().optional(),
  status: z.enum(['listening', 'completed', 'queued', 'abandoned']).optional(),
}).refine(
  data => data.visible !== undefined || data.status !== undefined,
  { message: 'At least one of visible or status is required' }
)

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ asin: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { asin } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch existing row to preserve fields not being updated
  const { data: existing } = await admin
    .from('library_books')
    .select('visible, status')
    .eq('asin', asin)
    .maybeSingle()

  const upsertData = {
    asin,
    visible: parsed.data.visible ?? existing?.visible ?? true,
    status: parsed.data.status ?? existing?.status ?? 'queued',
    updated_at: new Date().toISOString(),
  }

  const { error } = await admin.from('library_books').upsert(upsertData)
  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  return NextResponse.json({ asin, visible: upsertData.visible, status: upsertData.status })
}
```

- [ ] **Step 2: Verify build compiles cleanly**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/admin/biblioteca/[asin]/route.ts"
git commit -m "feat: add PATCH /api/admin/biblioteca/[asin]"
```

---

## Task 5: Admin biblioteca page

**Files:**
- Create: `src/app/[locale]/admin/biblioteca/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/[locale]/admin/biblioteca/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import type { BookStatus } from '@/lib/library'

type AdminBook = {
  asin: string
  title: string
  authors: string[]
  cover_url: string
  runtime_length_min: number
  visible: boolean
  status: BookStatus
}

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'listening', label: 'leyendo' },
  { value: 'completed', label: 'completado' },
  { value: 'queued', label: 'en lista' },
  { value: 'abandoned', label: 'abandonado' },
]

export default function AdminBibliotecaPage() {
  const router = useRouter()
  const [books, setBooks] = useState<AdminBook[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchBooks() }, [])

  async function fetchBooks() {
    const res = await fetch('/api/admin/biblioteca')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setBooks(data.books ?? [])
    setLoading(false)
  }

  async function update(asin: string, patch: { visible?: boolean; status?: BookStatus }) {
    setSaving(asin)
    setBooks(bs => bs.map(b => b.asin === asin ? { ...b, ...patch } : b))
    await fetch(`/api/admin/biblioteca/${asin}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setSaving(null)
    setSaved(asin)
    setTimeout(() => setSaved(s => s === asin ? null : s), 1500)
  }

  const filtered = books.filter(b =>
    search === '' ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.authors.some(a => a.toLowerCase().includes(search.toLowerCase()))
  )
  const hiddenCount = books.filter(b => !b.visible).length

  return (
    <div>
      <h1 className="text-xl font-bold text-text mb-1">Biblioteca</h1>
      <p className="font-mono text-xs text-text-muted mb-8">
        // {books.length} libros · {hiddenCount} ocultos
      </p>

      {loading ? (
        <p className="font-mono text-xs text-text-muted">// cargando...</p>
      ) : (
        <>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="buscar por título o autor..."
            className="w-full font-mono text-xs bg-surface border border-border rounded-sm px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-accent mb-6"
          />

          <div className="space-y-2">
            {filtered.map(book => (
              <BookRow
                key={book.asin}
                book={book}
                saving={saving === book.asin}
                saved={saved === book.asin}
                onUpdate={update}
              />
            ))}
            {filtered.length === 0 && (
              <p className="font-mono text-xs text-text-muted">// sin resultados</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function BookRow({
  book,
  saving,
  saved,
  onUpdate,
}: {
  book: AdminBook
  saving: boolean
  saved: boolean
  onUpdate: (asin: string, patch: { visible?: boolean; status?: BookStatus }) => void
}) {
  const hours = Math.floor(book.runtime_length_min / 60)
  const minutes = book.runtime_length_min % 60

  return (
    <div
      className={`flex items-center gap-3 border rounded-sm p-3 transition-all ${
        saved
          ? 'border-accent/50 bg-accent/5'
          : book.visible
            ? 'border-border bg-surface'
            : 'border-border bg-surface opacity-50'
      }`}
    >
      {book.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={book.cover_url} alt="" className="w-8 h-10 object-cover rounded-sm shrink-0" />
      ) : (
        <div className="w-8 h-10 bg-background rounded-sm shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text truncate">{book.title}</p>
        <p className="font-mono text-[10px] text-text-muted truncate">
          {book.authors.join(', ')} · {hours}h {minutes}m
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <select
          value={book.status}
          onChange={e => onUpdate(book.asin, { status: e.target.value as BookStatus })}
          disabled={saving}
          className="font-mono text-[10px] bg-background border border-border rounded-sm px-2 py-1 text-text-secondary focus:outline-none focus:border-accent disabled:opacity-50"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={() => onUpdate(book.asin, { visible: !book.visible })}
          disabled={saving}
          className={`font-mono text-[10px] px-2 py-1 rounded-sm border transition-colors disabled:opacity-50 ${
            book.visible
              ? 'border-accent text-accent hover:bg-accent/10'
              : 'border-border text-text-muted hover:border-accent hover:text-accent'
          }`}
        >
          {saving ? '...' : book.visible ? 'visible' : 'oculto'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build compiles cleanly**

```bash
npm run build
```
Expected: exits 0, `/[locale]/admin/biblioteca` appears in route output.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/admin/biblioteca/page.tsx"
git commit -m "feat: add admin biblioteca page with visibility and status toggles"
```

---

## Task 6: Update public biblioteca page to apply overrides

**Files:**
- Modify: `src/app/[locale]/biblioteca/page.tsx`

- [ ] **Step 1: Update the page to fetch and apply Supabase overrides**

Replace the full contents of `src/app/[locale]/biblioteca/page.tsx` with:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllBooks, applyBookOverrides } from '@/lib/library'
import type { BookOverride } from '@/lib/library'
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

  const admin = createAdminClient()
  const { data: overrides } = await admin
    .from('library_books')
    .select('asin, visible, status')
  const books = applyBookOverrides(getAllBooks(locale), (overrides ?? []) as BookOverride[])

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-accent mb-2">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">{t('title')}</h1>
      <BookList books={books} locale={locale} />
    </div>
  )
}
```

- [ ] **Step 2: Verify build compiles cleanly**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/biblioteca/page.tsx"
git commit -m "feat: apply supabase visibility overrides on public biblioteca page"
```

---

## Task 7: AdminSidebar + admin overview

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`
- Modify: `src/app/[locale]/admin/page.tsx`

- [ ] **Step 1: Add Biblioteca to AdminSidebar NAV**

In `src/components/admin/AdminSidebar.tsx`, update the `NAV` constant (currently lines 9–13) to add biblioteca between guestbook and the end:

```ts
const NAV = [
  { href: '/admin' as const, label: 'Overview', icon: '◈' },
  { href: '/admin/comments' as const, label: 'Comentarios', icon: '✦' },
  { href: '/admin/guestbook' as const, label: 'Firmas', icon: '◇' },
  { href: '/admin/biblioteca' as const, label: 'Biblioteca', icon: '◎' },
]
```

- [ ] **Step 2: Update admin overview page**

Replace the full contents of `src/app/[locale]/admin/page.tsx` with:

```tsx
import { createAdminClient } from '@/lib/supabase/server'
import { getBookAsins } from '@/lib/library'
import { Link } from '@/i18n/navigation'

async function getStats() {
  const admin = createAdminClient()
  const [comments, guestbook, libBooks] = await Promise.all([
    admin.from('comments').select('id, approved'),
    admin.from('guestbook_entries').select('id, approved'),
    admin.from('library_books').select('asin, visible'),
  ])
  const c = comments.data ?? []
  const g = guestbook.data ?? []
  const lb = libBooks.data ?? []
  return {
    commentsPending: c.filter(x => !x.approved).length,
    commentsTotal: c.length,
    guestbookPending: g.filter(x => !x.approved).length,
    guestbookTotal: g.length,
    booksHidden: lb.filter(x => !x.visible).length,
    booksTotal: getBookAsins().length,
  }
}

export default async function AdminOverviewPage() {
  const stats = await getStats()
  const totalPending = stats.commentsPending + stats.guestbookPending

  return (
    <div>
      <h1 className="text-xl font-bold text-text mb-1">Overview</h1>
      <p className="font-mono text-xs text-text-muted mb-8">
        {totalPending === 0
          ? '// todo aprobado, nada pendiente'
          : `// ${totalPending} elemento${totalPending !== 1 ? 's' : ''} pendiente${totalPending !== 1 ? 's' : ''} de revisión`}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <StatCard
          label="Comentarios pendientes"
          value={stats.commentsPending}
          total={stats.commentsTotal}
          href="/admin/comments"
          accent={stats.commentsPending > 0}
        />
        <StatCard
          label="Firmas pendientes"
          value={stats.guestbookPending}
          total={stats.guestbookTotal}
          href="/admin/guestbook"
          accent={stats.guestbookPending > 0}
        />
        <StatCard
          label="Libros ocultos"
          value={stats.booksHidden}
          total={stats.booksTotal}
          href="/admin/biblioteca"
          accent={false}
        />
      </div>

      <div className="border-t border-border pt-8">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-4">
          // acceso rápido
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/comments"
            className="font-mono text-xs border border-border text-text-secondary px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Gestionar comentarios →
          </Link>
          <Link
            href="/admin/guestbook"
            className="font-mono text-xs border border-border text-text-secondary px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Gestionar firmas →
          </Link>
          <Link
            href="/admin/biblioteca"
            className="font-mono text-xs border border-border text-text-secondary px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Gestionar biblioteca →
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, total, href, accent,
}: {
  label: string
  value: number
  total: number
  href: string
  accent: boolean
}) {
  return (
    <Link href={href} className="block border border-border rounded-sm p-5 hover:border-accent/50 transition-colors group bg-surface">
      <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-3">{label}</p>
      <p className={`text-4xl font-extrabold tracking-tight mb-1 ${accent ? 'text-accent' : 'text-text'}`}>
        {value}
      </p>
      <p className="font-mono text-[10px] text-text-muted">{total} total</p>
    </Link>
  )
}
```

- [ ] **Step 3: Run full test suite**

```bash
npm run test:run
```
Expected: all 15 tests PASS (7 test files).

- [ ] **Step 4: Run build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx "src/app/[locale]/admin/page.tsx"
git commit -m "feat: add biblioteca to admin sidebar and overview stats"
```
