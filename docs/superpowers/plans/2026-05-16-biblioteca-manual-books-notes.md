# Biblioteca: Libros Manuales + Notas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add manual books (physical/ebook) with metadata search and Supabase-backed notes management (rating, highlights, Markdown review) for all books.

**Architecture:** A new `unified-library.ts` module merges Audible JSON + `manual_books` Supabase table into `UnifiedBook[]`, enriched with ratings from `book_notes`. API routes handle book search (Google Books + Open Library fallback), manual book CRUD, and notes upsert. Admin gets an add-book form with search and a notes editor page.

**Tech Stack:** Next.js 16 App Router, Supabase, Zod, react-markdown (new), Google Books API, Open Library API, Vitest, Tailwind CSS v4.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `supabase/migrations/` | Add migrations 003 + 004 (manual steps) |
| Modify | `src/lib/library.ts` | Export `VALID_STATUSES` |
| Create | `src/lib/unified-library.ts` | UnifiedBook types + async merge functions |
| Create | `src/lib/__tests__/unified-library.test.ts` | Tests for `isUuid` |
| Modify | `next.config.ts` | Add covers.openlibrary.org + books.google.com to remotePatterns |
| Create | `src/app/api/admin/book-search/route.ts` | Google Books + OL fallback |
| Create | `src/app/api/admin/manual-books/route.ts` | POST create manual book |
| Create | `src/app/api/admin/manual-books/[id]/route.ts` | PATCH + DELETE manual book |
| Create | `src/app/api/admin/book-notes/[id]/route.ts` | GET + PUT notes |
| Modify | `src/app/api/admin/biblioteca/route.ts` | Include manual books in response |
| Modify | `src/components/BookCard.tsx` | Accept UnifiedBook, link to book.id |
| Modify | `src/components/BookList.tsx` | Accept UnifiedBook[] |
| Modify | `src/app/[locale]/admin/biblioteca/page.tsx` | Add/notes/delete buttons, source badges |
| Create | `src/app/[locale]/admin/biblioteca/add/page.tsx` | Search + add form |
| Create | `src/app/[locale]/admin/biblioteca/[id]/notes/page.tsx` | Notes editor |
| Modify | `src/app/[locale]/biblioteca/page.tsx` | Use getAllUnifiedBooks |
| Modify | `src/app/[locale]/biblioteca/[asin]/page.tsx` | Use getUnifiedBook, react-markdown |

---

## Task 1: DB migrations + react-markdown (manual steps)

**This task is entirely manual — no code to write.**

- [ ] **Step 1: Run migration 003 in Supabase SQL Editor**

Go to supabase.com → project `orlniujfwolyinsuezcu` → SQL Editor → New query. Run:

```sql
CREATE TABLE manual_books (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  authors        TEXT[] NOT NULL DEFAULT '{}',
  cover_url      TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  source_type    TEXT NOT NULL DEFAULT 'physical',
  isbn           TEXT,
  published_year INT,
  visible        BOOLEAN NOT NULL DEFAULT TRUE,
  status         TEXT NOT NULL DEFAULT 'queued',
  added_at       TIMESTAMPTZ DEFAULT NOW()
);
```

Expected: `Success. No rows returned`.

- [ ] **Step 2: Run migration 004 in Supabase SQL Editor**

New query. Run:

```sql
CREATE TABLE book_notes (
  book_id     TEXT PRIMARY KEY,
  rating      INT CHECK (rating >= 1 AND rating <= 5),
  highlights  TEXT[] NOT NULL DEFAULT '{}',
  review_md   TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Expected: `Success. No rows returned`.

- [ ] **Step 3: Create migration files in the repo**

```bash
cat > supabase/migrations/003_manual_books.sql << 'EOF'
CREATE TABLE manual_books (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  authors        TEXT[] NOT NULL DEFAULT '{}',
  cover_url      TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  source_type    TEXT NOT NULL DEFAULT 'physical',
  isbn           TEXT,
  published_year INT,
  visible        BOOLEAN NOT NULL DEFAULT TRUE,
  status         TEXT NOT NULL DEFAULT 'queued',
  added_at       TIMESTAMPTZ DEFAULT NOW()
);
EOF

cat > supabase/migrations/004_book_notes.sql << 'EOF'
CREATE TABLE book_notes (
  book_id     TEXT PRIMARY KEY,
  rating      INT CHECK (rating >= 1 AND rating <= 5),
  highlights  TEXT[] NOT NULL DEFAULT '{}',
  review_md   TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
EOF
```

- [ ] **Step 4: Install react-markdown**

```bash
npm install react-markdown
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/003_manual_books.sql supabase/migrations/004_book_notes.sql package.json package-lock.json
git commit -m "chore: add manual_books and book_notes migrations, install react-markdown"
```

---

## Task 2: Export VALID_STATUSES from library.ts

**Files:**
- Modify: `src/lib/library.ts`

- [ ] **Step 1: Change VALID_STATUSES from const to exported const**

In `src/lib/library.ts`, change line:
```ts
const VALID_STATUSES: BookStatus[] = ['listening', 'completed', 'queued', 'abandoned']
```
to:
```ts
export const VALID_STATUSES: BookStatus[] = ['listening', 'completed', 'queued', 'abandoned']
```

- [ ] **Step 2: Verify build compiles**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/library.ts
git commit -m "feat: export VALID_STATUSES from library"
```

---

## Task 3: unified-library.ts (TDD)

**Files:**
- Create: `src/lib/unified-library.ts`
- Create: `src/lib/__tests__/unified-library.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/unified-library.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isUuid } from '../unified-library'

describe('isUuid', () => {
  it('returns true for a valid UUID v4', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('returns true for a UUID generated by Supabase gen_random_uuid()', () => {
    expect(isUuid('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')).toBe(true)
  })

  it('returns false for an Audible ASIN', () => {
    expect(isUuid('B001TEST00')).toBe(false)
  })

  it('returns false for a standard 10-char ASIN', () => {
    expect(isUuid('0062945149')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isUuid('')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm run test:run -- src/lib/__tests__/unified-library.test.ts
```
Expected: FAIL — `Cannot find module '../unified-library'`

- [ ] **Step 3: Create unified-library.ts**

Create `src/lib/unified-library.ts`:

```ts
import { createAdminClient } from '@/lib/supabase/server'
import { getAllBooks, getBook, VALID_STATUSES } from '@/lib/library'
import type { BookStatus } from '@/lib/library'

export type BookSource = 'audible' | 'manual'
export type BookSourceType = 'physical' | 'ebook' | 'other'

export type UnifiedBook = {
  id: string
  source: BookSource
  source_type?: BookSourceType
  title: string
  authors: string[]
  narrators: string[]
  cover_url: string
  runtime_length_min: number
  purchase_date: string
  description: string
  visible: boolean
  status: BookStatus
  rating: number | null
}

export type UnifiedBookDetail = UnifiedBook & {
  highlights: string[]
  review_md: string | null
}

export function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(id)
}

function toStatus(s: string): BookStatus {
  return VALID_STATUSES.includes(s as BookStatus) ? (s as BookStatus) : 'queued'
}

export async function getAllUnifiedBooks(locale: string): Promise<UnifiedBook[]> {
  const admin = createAdminClient()

  const [manualResult, overridesResult, notesResult] = await Promise.all([
    admin.from('manual_books').select('*'),
    admin.from('library_books').select('asin, visible, status'),
    admin.from('book_notes').select('book_id, rating'),
  ])

  const overrideMap = new Map((overridesResult.data ?? []).map(r => [r.asin, r]))
  const notesMap = new Map((notesResult.data ?? []).map(r => [r.book_id, r.rating as number | null]))

  const audibleBooks: UnifiedBook[] = getAllBooks(locale).map(book => {
    const o = overrideMap.get(book.asin)
    return {
      id: book.asin,
      source: 'audible' as const,
      title: book.title,
      authors: book.authors,
      narrators: book.narrators,
      cover_url: book.cover_url,
      runtime_length_min: book.runtime_length_min,
      purchase_date: book.purchase_date,
      description: book.publisher_summary,
      visible: o ? Boolean(o.visible) : true,
      status: toStatus(o?.status ?? book.status),
      rating: notesMap.has(book.asin) ? notesMap.get(book.asin) ?? null : book.rating,
    }
  })

  const manualBooks: UnifiedBook[] = (manualResult.data ?? []).map(b => ({
    id: b.id as string,
    source: 'manual' as const,
    source_type: (b.source_type ?? 'physical') as BookSourceType,
    title: b.title as string,
    authors: (b.authors ?? []) as string[],
    narrators: [],
    cover_url: (b.cover_url ?? '') as string,
    runtime_length_min: 0,
    purchase_date: ((b.added_at as string | null)?.split('T')[0]) ?? '',
    description: (b.description ?? '') as string,
    visible: Boolean(b.visible),
    status: toStatus(b.status ?? 'queued'),
    rating: notesMap.has(b.id) ? notesMap.get(b.id) ?? null : null,
  }))

  return [...audibleBooks, ...manualBooks]
    .filter(b => b.visible)
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
}

export async function getUnifiedBook(id: string, locale: string): Promise<UnifiedBookDetail | null> {
  const admin = createAdminClient()

  if (isUuid(id)) {
    const { data: book } = await admin.from('manual_books').select('*').eq('id', id).maybeSingle()
    if (!book) return null
    const { data: notes } = await admin.from('book_notes').select('*').eq('book_id', id).maybeSingle()
    return {
      id: book.id as string,
      source: 'manual' as const,
      source_type: (book.source_type ?? 'physical') as BookSourceType,
      title: book.title as string,
      authors: (book.authors ?? []) as string[],
      narrators: [],
      cover_url: (book.cover_url ?? '') as string,
      runtime_length_min: 0,
      purchase_date: ((book.added_at as string | null)?.split('T')[0]) ?? '',
      description: (book.description ?? '') as string,
      visible: Boolean(book.visible),
      status: toStatus(book.status ?? 'queued'),
      rating: (notes?.rating as number | null) ?? null,
      highlights: (notes?.highlights as string[] | null) ?? [],
      review_md: (notes?.review_md as string | null) ?? null,
    }
  }

  const book = getBook(id, locale)
  if (!book) return null

  const [overrideResult, notesResult] = await Promise.all([
    admin.from('library_books').select('visible, status').eq('asin', id).maybeSingle(),
    admin.from('book_notes').select('*').eq('book_id', id).maybeSingle(),
  ])

  const o = overrideResult.data
  const n = notesResult.data

  return {
    id: book.asin,
    source: 'audible' as const,
    title: book.title,
    authors: book.authors,
    narrators: book.narrators,
    cover_url: book.cover_url,
    runtime_length_min: book.runtime_length_min,
    purchase_date: book.purchase_date,
    description: book.publisher_summary,
    visible: o ? Boolean(o.visible) : true,
    status: toStatus(o?.status ?? book.status),
    rating: (n?.rating as number | null) ?? book.rating,
    highlights: (n?.highlights as string[] | null) ?? book.highlights,
    review_md: (n?.review_md as string | null) ?? null,
  }
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm run test:run -- src/lib/__tests__/unified-library.test.ts
```
Expected: 5 tests PASS.

- [ ] **Step 5: Run full test suite**

```bash
npm run test:run
```
Expected: all existing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/unified-library.ts src/lib/__tests__/unified-library.test.ts
git commit -m "feat: add unified-library with UnifiedBook types and async merge functions"
```

---

## Task 4: Add image domains to next.config.ts

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add OpenLibrary and Google Books to remotePatterns**

Replace the `images` config in `next.config.ts`:

```ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'books.google.com' },
    ],
  },
}

export default withNextIntl(nextConfig)
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "feat: add openlibrary and google books image domains"
```

---

## Task 5: GET /api/admin/book-search

**Files:**
- Create: `src/app/api/admin/book-search/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/admin/book-search/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type SearchResult = {
  title: string
  authors: string[]
  cover_url: string
  description: string
  isbn?: string
  published_year?: number
}

async function searchGoogleBooks(q: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return []
  const data = await res.json() as { items?: unknown[] }
  return ((data.items ?? []) as Record<string, unknown>[])
    .map(item => {
      const info = (item.volumeInfo ?? {}) as Record<string, unknown>
      const imageLinks = info.imageLinks as Record<string, string> | undefined
      const cover = (imageLinks?.thumbnail ?? '').replace('http://', 'https://')
      const identifiers = info.industryIdentifiers as Array<{ type: string; identifier: string }> | undefined
      const isbn = identifiers?.find(i => i.type === 'ISBN_13')?.identifier
      const publishedDate = info.publishedDate as string | undefined
      const year = publishedDate ? parseInt(publishedDate.slice(0, 4)) : undefined
      return {
        title: (info.title as string) ?? '',
        authors: (info.authors as string[]) ?? [],
        cover_url: cover,
        description: (info.description as string) ?? '',
        ...(isbn && { isbn }),
        ...(year && !isNaN(year) && { published_year: year }),
      }
    })
    .filter(r => Boolean(r.title))
}

async function searchOpenLibrary(q: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return []
  const data = await res.json() as { docs?: unknown[] }
  return ((data.docs ?? []) as Record<string, unknown>[])
    .map(doc => {
      const coverId = doc.cover_i as number | undefined
      const cover_url = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : ''
      const isbns = doc.isbn as string[] | undefined
      const authorNames = doc.author_name as string[] | undefined
      return {
        title: (doc.title as string) ?? '',
        authors: authorNames ?? [],
        cover_url,
        description: '',
        ...(isbns?.[0] && { isbn: isbns[0] }),
        ...(doc.first_publish_year && { published_year: doc.first_publish_year as number }),
      }
    })
    .filter(r => Boolean(r.title))
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  if (!q) return NextResponse.json({ results: [] })

  let results = await searchGoogleBooks(q)
  if (results.length === 0) results = await searchOpenLibrary(q)

  return NextResponse.json({ results })
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/book-search/route.ts
git commit -m "feat: add GET /api/admin/book-search with Google Books + Open Library fallback"
```

---

## Task 6: Manual books API routes

**Files:**
- Create: `src/app/api/admin/manual-books/route.ts`
- Create: `src/app/api/admin/manual-books/[id]/route.ts`

- [ ] **Step 1: Create POST route**

Create `src/app/api/admin/manual-books/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).default([]),
  cover_url: z.string().default(''),
  description: z.string().default(''),
  source_type: z.enum(['physical', 'ebook', 'other']).default('physical'),
  isbn: z.string().optional(),
  published_year: z.number().int().min(1000).max(2100).optional(),
})

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.from('manual_books').insert(parsed.data).select().single()
  if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 2: Create PATCH + DELETE route**

Create `src/app/api/admin/manual-books/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const patchSchema = z.object({
  visible: z.boolean().optional(),
  status: z.enum(['listening', 'completed', 'queued', 'abandoned']).optional(),
}).refine(d => d.visible !== undefined || d.status !== undefined, {
  message: 'At least one field required',
})

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('manual_books').select('visible, status').eq('id', id).maybeSingle()

  const update = {
    visible: parsed.data.visible ?? existing?.visible ?? true,
    status: parsed.data.status ?? existing?.status ?? 'queued',
  }

  const { error } = await admin.from('manual_books').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  return NextResponse.json({ id, ...update })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  await admin.from('book_notes').delete().eq('book_id', id)
  const { error } = await admin.from('manual_books').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/manual-books/route.ts "src/app/api/admin/manual-books/[id]/route.ts"
git commit -m "feat: add manual books CRUD API routes"
```

---

## Task 7: Book notes API route

**Files:**
- Create: `src/app/api/admin/book-notes/[id]/route.ts`

- [ ] **Step 1: Create GET + PUT route**

Create `src/app/api/admin/book-notes/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const putSchema = z.object({
  rating: z.number().int().min(1).max(5).nullable().optional(),
  highlights: z.array(z.string()).optional(),
  review_md: z.string().optional(),
})

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()
  const { data } = await admin.from('book_notes').select('*').eq('book_id', id).maybeSingle()

  return NextResponse.json({
    rating: (data?.rating as number | null) ?? null,
    highlights: (data?.highlights as string[] | null) ?? [],
    review_md: (data?.review_md as string | null) ?? '',
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('book_notes').select('*').eq('book_id', id).maybeSingle()

  const upsert = {
    book_id: id,
    rating: parsed.data.rating !== undefined ? parsed.data.rating : ((existing?.rating as number | null) ?? null),
    highlights: parsed.data.highlights ?? ((existing?.highlights as string[] | null) ?? []),
    review_md: parsed.data.review_md ?? ((existing?.review_md as string | null) ?? ''),
    updated_at: new Date().toISOString(),
  }

  const { error } = await admin.from('book_notes').upsert(upsert)
  if (error) return NextResponse.json({ error: 'Failed to save' }, { status: 500 })

  return NextResponse.json({ book_id: id, ...upsert })
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/admin/book-notes/[id]/route.ts"
git commit -m "feat: add book notes GET + PUT API route"
```

---

## Task 8: Update GET /api/admin/biblioteca to include manual books

**Files:**
- Modify: `src/app/api/admin/biblioteca/route.ts`

- [ ] **Step 1: Replace the route file**

Replace the full contents of `src/app/api/admin/biblioteca/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getAllBooks } from '@/lib/library'
import type { BookStatus } from '@/lib/library'

type AdminBook = {
  id: string
  source: 'audible' | 'manual'
  source_type?: string
  title: string
  authors: string[]
  cover_url: string
  runtime_length_min: number
  visible: boolean
  status: BookStatus
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const [overridesResult, manualResult] = await Promise.all([
    admin.from('library_books').select('asin, visible, status'),
    admin.from('manual_books').select('id, title, authors, cover_url, runtime_length_min, visible, status, source_type'),
  ])

  if (overridesResult.error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  const overrideMap = new Map((overridesResult.data ?? []).map(r => [r.asin, r]))

  const audibleBooks: AdminBook[] = getAllBooks('es').map(book => {
    const o = overrideMap.get(book.asin)
    return {
      id: book.asin,
      source: 'audible' as const,
      title: book.title,
      authors: book.authors,
      cover_url: book.cover_url,
      runtime_length_min: book.runtime_length_min,
      visible: o ? Boolean(o.visible) : true,
      status: (o ? o.status : book.status) as BookStatus,
    }
  })

  const manualBooks: AdminBook[] = (manualResult.data ?? []).map(b => ({
    id: b.id as string,
    source: 'manual' as const,
    source_type: (b.source_type as string | undefined) ?? 'physical',
    title: b.title as string,
    authors: (b.authors as string[] | null) ?? [],
    cover_url: (b.cover_url as string | null) ?? '',
    runtime_length_min: 0,
    visible: Boolean(b.visible),
    status: (b.status as BookStatus) ?? 'queued',
  }))

  return NextResponse.json({ books: [...audibleBooks, ...manualBooks] })
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/biblioteca/route.ts
git commit -m "feat: include manual books in admin biblioteca GET response"
```

---

## Task 9: Update admin biblioteca page

**Files:**
- Modify: `src/app/[locale]/admin/biblioteca/page.tsx`

- [ ] **Step 1: Replace the page with full updated version**

Replace the full contents of `src/app/[locale]/admin/biblioteca/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import type { BookStatus } from '@/lib/library'

type AdminBook = {
  id: string
  source: 'audible' | 'manual'
  source_type?: string
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

const SOURCE_TYPE_LABEL: Record<string, string> = {
  physical: 'físico',
  ebook: 'ebook',
  other: 'otro',
}

export default function AdminBibliotecaPage() {
  const router = useRouter()
  const [books, setBooks] = useState<AdminBook[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function fetchBooks() {
    const res = await fetch('/api/admin/biblioteca')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setBooks(data.books ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchBooks() }, [])

  async function update(bookId: string, source: 'audible' | 'manual', patch: { visible?: boolean; status?: BookStatus }) {
    const prev = books.find(b => b.id === bookId)
    setSaving(bookId)
    setBooks(bs => bs.map(b => b.id === bookId ? { ...b, ...patch } : b))
    const endpoint = source === 'manual'
      ? `/api/admin/manual-books/${bookId}`
      : `/api/admin/biblioteca/${bookId}`
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setSaving(null)
    if (!res.ok) {
      if (prev) setBooks(bs => bs.map(b => b.id === bookId ? prev : b))
      return
    }
    setSaved(bookId)
    setTimeout(() => setSaved(s => s === bookId ? null : s), 1500)
  }

  async function deleteBook(id: string) {
    setBooks(bs => bs.filter(b => b.id !== id))
    await fetch(`/api/admin/manual-books/${id}`, { method: 'DELETE' })
  }

  const filtered = books.filter(b =>
    search === '' ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.authors.some(a => a.toLowerCase().includes(search.toLowerCase()))
  )
  const hiddenCount = books.filter(b => !b.visible).length

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-text">Biblioteca</h1>
        <Link
          href="/admin/biblioteca/add"
          className="font-mono text-xs border border-border text-text-secondary px-3 py-1.5 rounded-sm hover:border-accent hover:text-accent transition-colors"
        >
          + Agregar libro
        </Link>
      </div>
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
                key={book.id}
                book={book}
                saving={saving === book.id}
                saved={saved === book.id}
                onUpdate={update}
                onDelete={deleteBook}
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
  book, saving, saved, onUpdate, onDelete,
}: {
  book: AdminBook
  saving: boolean
  saved: boolean
  onUpdate: (id: string, source: 'audible' | 'manual', patch: { visible?: boolean; status?: BookStatus }) => void
  onDelete: (id: string) => void
}) {
  const hours = Math.floor(book.runtime_length_min / 60)
  const minutes = book.runtime_length_min % 60

  return (
    <div
      className={`flex items-center gap-3 border rounded-sm p-3 transition-all ${
        saved ? 'border-accent/50 bg-accent/5'
          : book.visible ? 'border-border bg-surface'
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
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-xs font-semibold text-text truncate">{book.title}</p>
          {book.source === 'manual' && book.source_type && (
            <span className="font-mono text-[9px] text-text-muted border border-border px-1 rounded-sm shrink-0">
              {SOURCE_TYPE_LABEL[book.source_type] ?? book.source_type}
            </span>
          )}
        </div>
        <p className="font-mono text-[10px] text-text-muted truncate">
          {book.authors.join(', ')}
          {book.runtime_length_min > 0 && ` · ${hours}h ${minutes}m`}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/admin/biblioteca/${book.id}/notes`}
          className="font-mono text-[10px] text-text-muted hover:text-accent transition-colors"
        >
          notas →
        </Link>

        <select
          value={book.status}
          onChange={e => onUpdate(book.id, book.source, { status: e.target.value as BookStatus })}
          disabled={saving}
          className="font-mono text-[10px] bg-background border border-border rounded-sm px-2 py-1 text-text-secondary focus:outline-none focus:border-accent disabled:opacity-50"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={() => onUpdate(book.id, book.source, { visible: !book.visible })}
          disabled={saving}
          className={`font-mono text-[10px] px-2 py-1 rounded-sm border transition-colors disabled:opacity-50 ${
            book.visible
              ? 'border-accent text-accent hover:bg-accent/10'
              : 'border-border text-text-muted hover:border-accent hover:text-accent'
          }`}
        >
          {saving ? '...' : book.visible ? 'visible' : 'oculto'}
        </button>

        {book.source === 'manual' && (
          <button
            onClick={() => onDelete(book.id)}
            className="font-mono text-[10px] text-red-400 hover:underline"
          >
            delete
          </button>
        )}
      </div>
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
git add "src/app/[locale]/admin/biblioteca/page.tsx"
git commit -m "feat: update admin biblioteca with manual book support, notes links, delete"
```

---

## Task 10: /admin/biblioteca/add page

**Files:**
- Create: `src/app/[locale]/admin/biblioteca/add/page.tsx`

- [ ] **Step 1: Create the add book page**

Create `src/app/[locale]/admin/biblioteca/add/page.tsx`:

```tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'

type SearchResult = {
  title: string
  authors: string[]
  cover_url: string
  description: string
  isbn?: string
  published_year?: number
}

type Form = {
  title: string
  authors: string
  cover_url: string
  description: string
  source_type: 'physical' | 'ebook' | 'other'
  isbn: string
  published_year: string
}

const EMPTY_FORM: Form = {
  title: '', authors: '', cover_url: '', description: '',
  source_type: 'physical', isbn: '', published_year: '',
}

export default function AddBookPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function onQueryChange(q: string) {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/admin/book-search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch { setResults([]) }
      setSearching(false)
    }, 400)
  }

  function selectResult(result: SearchResult) {
    setForm({
      title: result.title,
      authors: result.authors.join(', '),
      cover_url: result.cover_url,
      description: result.description,
      source_type: 'physical',
      isbn: result.isbn ?? '',
      published_year: result.published_year?.toString() ?? '',
    })
    setResults([])
    setQuery('')
  }

  async function save() {
    if (!form.title.trim()) { setError('El título es requerido'); return }
    setSaving(true)
    setError('')
    const payload = {
      title: form.title.trim(),
      authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
      cover_url: form.cover_url.trim(),
      description: form.description.trim(),
      source_type: form.source_type,
      ...(form.isbn.trim() && { isbn: form.isbn.trim() }),
      ...(form.published_year.trim() && { published_year: parseInt(form.published_year) }),
    }
    const res = await fetch('/api/admin/manual-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      router.push('/admin/biblioteca')
    } else {
      setError('Error al guardar. Intenta de nuevo.')
      setSaving(false)
    }
  }

  return (
    <div>
      <Link
        href="/admin/biblioteca"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-8 block"
      >
        ← Biblioteca
      </Link>
      <h1 className="text-xl font-bold text-text mb-1">Agregar libro</h1>
      <p className="font-mono text-xs text-text-muted mb-8">// busca y selecciona, o llena el formulario</p>

      <div className="mb-6 relative">
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="buscar por título o autor..."
          className="w-full font-mono text-xs bg-surface border border-border rounded-sm px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        {searching && (
          <p className="font-mono text-xs text-text-muted mt-2">// buscando...</p>
        )}
        {results.length > 0 && (
          <div className="mt-2 border border-border rounded-sm bg-surface divide-y divide-border">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => selectResult(r)}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent/5 text-left transition-colors"
              >
                {r.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.cover_url} alt="" className="w-8 h-10 object-cover rounded-sm shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text truncate">{r.title}</p>
                  <p className="font-mono text-[10px] text-text-muted truncate">{r.authors.join(', ')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Field label="Título *">
          <input
            type="text" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
          />
        </Field>

        <Field label="Autores (separados por coma)">
          <input
            type="text" value={form.authors}
            onChange={e => setForm(f => ({ ...f, authors: e.target.value }))}
            className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
          />
        </Field>

        <Field label="URL portada">
          <input
            type="text" value={form.cover_url}
            onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))}
            className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
          />
        </Field>

        <Field label="Tipo">
          <div className="flex gap-3">
            {(['physical', 'ebook', 'other'] as const).map(t => (
              <label key={t} className="flex items-center gap-1.5 font-mono text-xs text-text-secondary cursor-pointer">
                <input
                  type="radio" name="source_type" value={t}
                  checked={form.source_type === t}
                  onChange={() => setForm(f => ({ ...f, source_type: t }))}
                />
                {t === 'physical' ? 'físico' : t}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Descripción">
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent resize-none"
          />
        </Field>

        <div className="flex gap-4">
          <Field label="ISBN">
            <input
              type="text" value={form.isbn}
              onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
              className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
            />
          </Field>
          <Field label="Año publicación">
            <input
              type="number" value={form.published_year}
              onChange={e => setForm(f => ({ ...f, published_year: e.target.value }))}
              className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
            />
          </Field>
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="font-mono text-xs bg-accent text-background px-4 py-2 rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar libro'}
          </button>
          <Link
            href="/admin/biblioteca"
            className="font-mono text-xs border border-border text-text-secondary px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] text-text-muted mb-1.5">{label}</p>
      {children}
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
git add "src/app/[locale]/admin/biblioteca/add/page.tsx"
git commit -m "feat: add book search + manual book creation page"
```

---

## Task 11: /admin/biblioteca/[id]/notes page

**Files:**
- Create: `src/app/[locale]/admin/biblioteca/[id]/notes/page.tsx`

- [ ] **Step 1: Create the notes editor page**

Create `src/app/[locale]/admin/biblioteca/[id]/notes/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import ReactMarkdown from 'react-markdown'

type Notes = {
  rating: number | null
  highlights: string[]
  review_md: string
}

export default function BookNotesPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = params.id
  const bookTitle = searchParams.get('title') ?? 'Libro'

  const [notes, setNotes] = useState<Notes>({ rating: null, highlights: [], review_md: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [newHighlight, setNewHighlight] = useState('')
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    fetch(`/api/admin/book-notes/${id}`)
      .then(r => r.json())
      .then(data => { setNotes(data); setLoading(false) })
  }, [id])

  async function save() {
    setSaving(true)
    setSavedMsg('')
    const res = await fetch(`/api/admin/book-notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes),
    })
    setSaving(false)
    setSavedMsg(res.ok ? '✓ Guardado' : 'Error al guardar')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  function setRating(r: number) {
    setNotes(n => ({ ...n, rating: n.rating === r ? null : r }))
  }

  function addHighlight() {
    const h = newHighlight.trim()
    if (!h) return
    setNotes(n => ({ ...n, highlights: [...n.highlights, h] }))
    setNewHighlight('')
  }

  function removeHighlight(i: number) {
    setNotes(n => ({ ...n, highlights: n.highlights.filter((_, idx) => idx !== i) }))
  }

  if (loading) return <p className="font-mono text-xs text-text-muted">// cargando...</p>

  return (
    <div>
      <Link
        href="/admin/biblioteca"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-8 block"
      >
        ← Biblioteca
      </Link>

      <h1 className="text-xl font-bold text-text mb-1">Notas</h1>
      <p className="font-mono text-xs text-text-muted mb-8 truncate">// {bookTitle}</p>

      <section className="mb-8">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-3">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`text-xl transition-colors ${n <= (notes.rating ?? 0) ? 'text-accent' : 'text-border hover:text-accent/50'}`}
            >
              ★
            </button>
          ))}
          {notes.rating !== null && (
            <button
              onClick={() => setNotes(n => ({ ...n, rating: null }))}
              className="font-mono text-[10px] text-text-muted hover:text-red-400 ml-2 transition-colors"
            >
              limpiar
            </button>
          )}
        </div>
      </section>

      <section className="mb-8">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-3">Highlights</p>
        <div className="space-y-2 mb-3">
          {notes.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 group">
              <p className="flex-1 text-xs text-text-secondary italic border-l-2 border-accent pl-3 py-0.5">{h}</p>
              <button
                onClick={() => removeHighlight(i)}
                className="font-mono text-[10px] text-text-muted hover:text-red-400 transition-colors shrink-0 mt-0.5"
              >
                ×
              </button>
            </div>
          ))}
          {notes.highlights.length === 0 && (
            <p className="font-mono text-xs text-text-muted">// sin highlights</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newHighlight}
            onChange={e => setNewHighlight(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addHighlight() }}
            placeholder="Agregar cita..."
            className="flex-1 font-mono text-xs bg-surface border border-border rounded-sm px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          <button
            onClick={addHighlight}
            className="font-mono text-xs border border-border text-text-secondary px-3 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Agregar
          </button>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Reseña</p>
          <div className="flex gap-1">
            {(['edit', 'preview'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`font-mono text-[10px] px-2 py-0.5 rounded-sm transition-colors ${
                  tab === t ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text'
                }`}
              >
                {t === 'edit' ? 'editar' : 'preview'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'edit' ? (
          <textarea
            value={notes.review_md}
            onChange={e => setNotes(n => ({ ...n, review_md: e.target.value }))}
            rows={10}
            placeholder="Escribe tu reseña en Markdown..."
            className="w-full font-mono text-xs bg-surface border border-border rounded-sm px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-accent resize-y"
          />
        ) : (
          <div className="mdx-prose min-h-[10rem] border border-border rounded-sm p-4 bg-surface">
            {notes.review_md
              ? <ReactMarkdown>{notes.review_md}</ReactMarkdown>
              : <p className="font-mono text-xs text-text-muted">// sin contenido</p>
            }
          </div>
        )}
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="font-mono text-xs bg-accent text-background px-4 py-2 rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar notas'}
        </button>
        {savedMsg && (
          <span className="font-mono text-xs text-accent">{savedMsg}</span>
        )}
      </div>
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
git add "src/app/[locale]/admin/biblioteca/[id]/notes/page.tsx"
git commit -m "feat: add book notes editor page (rating, highlights, markdown review)"
```

---

## Task 12: Update BookCard and BookList to use UnifiedBook

**Files:**
- Modify: `src/components/BookCard.tsx`
- Modify: `src/components/BookList.tsx`

- [ ] **Step 1: Update BookCard**

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
}: {
  book: UnifiedBook
  locale: string
  statusLabel: string
}) {
  const hours = Math.floor(book.runtime_length_min / 60)
  const minutes = book.runtime_length_min % 60

  return (
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
  )
}
```

- [ ] **Step 2: Update BookList**

In `src/components/BookList.tsx`, change the import and prop type. Replace the first 8 lines:

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import BookCard from './BookCard'
import type { BookStatus } from '@/lib/library'
import type { UnifiedBook } from '@/lib/unified-library'

const ALL_STATUSES: BookStatus[] = ['listening', 'completed', 'queued', 'abandoned']

export default function BookList({ books, locale }: { books: UnifiedBook[]; locale: string }) {
```

The rest of the component body stays identical except the `BookCard` key changes from `book.asin` to `book.id`. Find and replace:
```tsx
{filtered.map(book => (
  <BookCard
    key={book.id}
    book={book}
    locale={locale}
    statusLabel={statusLabel[book.status]}
  />
))}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/BookCard.tsx src/components/BookList.tsx
git commit -m "feat: update BookCard and BookList to use UnifiedBook type"
```

---

## Task 13: Update public biblioteca list page

**Files:**
- Modify: `src/app/[locale]/biblioteca/page.tsx`

- [ ] **Step 1: Replace with getAllUnifiedBooks**

Replace the full contents of `src/app/[locale]/biblioteca/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
  const books = await getAllUnifiedBooks(locale)

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-accent mb-2">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">{t('title')}</h1>
      <BookList books={books} locale={locale} />
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
git add "src/app/[locale]/biblioteca/page.tsx"
git commit -m "feat: use getAllUnifiedBooks on public biblioteca page"
```

---

## Task 14: Update public book detail page

**Files:**
- Modify: `src/app/[locale]/biblioteca/[asin]/page.tsx`

- [ ] **Step 1: Replace with getUnifiedBook and react-markdown**

Replace the full contents of `src/app/[locale]/biblioteca/[asin]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import ReactMarkdown from 'react-markdown'
import { getBookAsins } from '@/lib/library'
import { getUnifiedBook } from '@/lib/unified-library'
import StarRating from '@/components/StarRating'

export function generateStaticParams() {
  return getBookAsins().map(asin => ({ asin }))
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; asin: string }>
}): Promise<Metadata> {
  const { locale, asin } = await params
  const book = await getUnifiedBook(asin, locale)
  if (!book) return {}
  return {
    title: book.title,
    description: book.description.slice(0, 160),
    alternates: { canonical: `/${locale}/biblioteca/${asin}` },
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string; asin: string }>
}) {
  const { locale, asin } = await params
  const book = await getUnifiedBook(asin, locale)
  if (!book) notFound()

  const t = await getTranslations({ locale, namespace: 'biblioteca' })
  const hours = Math.floor(book.runtime_length_min / 60)
  const minutes = book.runtime_length_min % 60

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link
        href="/biblioteca"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-10 block"
      >
        ← {t('title')}
      </Link>

      <div className="flex gap-6 mb-8">
        {book.cover_url && (
          <div className="shrink-0 w-28 h-36 relative rounded-sm overflow-hidden bg-surface">
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-text mb-2">{book.title}</h1>
          <p className="font-mono text-xs text-text-secondary mb-1">{book.authors.join(', ')}</p>
          {book.narrators.length > 0 && (
            <p className="font-mono text-xs text-text-muted mb-3">
              {t('narrators')}: {book.narrators.join(', ')}
            </p>
          )}
          {book.rating !== null && (
            <div className="mb-3">
              <StarRating rating={book.rating} />
            </div>
          )}
          {book.runtime_length_min > 0 && (
            <p className="font-mono text-xs text-text-muted">
              {t('duration')}: {hours}h {minutes}m
            </p>
          )}
        </div>
      </div>

      {book.description && (
        <p className="text-xs text-text-secondary leading-relaxed mb-8">{book.description}</p>
      )}

      {book.highlights.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-xs text-accent mb-4">// {t('highlights')}</p>
          <div className="space-y-4">
            {book.highlights.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-accent pl-4 text-sm text-text-secondary italic"
              >
                {quote}
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {book.review_md && (
        <div className="mdx-prose mb-8">
          <ReactMarkdown>{book.review_md}</ReactMarkdown>
        </div>
      )}

      {book.source === 'audible' && (
        <a
          href={`https://www.audible.com/pd/${book.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-accent hover:underline mt-8 block"
        >
          {t('listenOnAudible')}
        </a>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm run test:run
```
Expected: all tests PASS.

- [ ] **Step 3: Run build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/biblioteca/[asin]/page.tsx"
git commit -m "feat: use getUnifiedBook and react-markdown on public detail page"
```
