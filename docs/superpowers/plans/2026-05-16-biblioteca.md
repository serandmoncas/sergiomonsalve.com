# Biblioteca Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/biblioteca` section that merges Audible library JSON with optional per-book MDX notes into a filterable book list and detail pages.

**Architecture:** `data/library.json` holds Audible metadata (populated by `scripts/import-audible.ts`). Optional `content/library/[locale]/[asin].mdx` files add status, rating, highlights, and a personal review. `src/lib/library.ts` merges both sources at read time — no database, fully static.

**Tech Stack:** Next.js 16 App Router, next-intl, gray-matter, next/image, Vitest, Tailwind CSS v4.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `data/library.json` | Audible metadata array (seed: empty) |
| Create | `scripts/import-audible.ts` | Normalizes audible-cli JSON → data/library.json |
| Create | `src/lib/library.ts` | getAllBooks, getBook, getBookAsins — merge logic |
| Create | `src/lib/__tests__/library.test.ts` | Unit tests for library.ts |
| Create | `src/components/StarRating.tsx` | Read-only ★ display |
| Create | `src/components/BookCard.tsx` | Card for list view (cover, title, author, status) |
| Create | `src/components/BookList.tsx` | Client component — status filter + grid |
| Create | `src/app/[locale]/biblioteca/page.tsx` | List page |
| Create | `src/app/[locale]/biblioteca/[asin]/page.tsx` | Detail page |
| Create | `content/library/es/.gitkeep` | Seed ES content dir |
| Create | `content/library/en/.gitkeep` | Seed EN content dir |
| Modify | `next.config.ts` | Add m.media-amazon.com to image remotePatterns |
| Modify | `src/messages/es.json` | Add biblioteca + nav + meta keys |
| Modify | `src/messages/en.json` | Add biblioteca + nav + meta keys |
| Modify | `src/components/Nav.tsx` | Add /biblioteca link |
| Modify | `src/app/sitemap.ts` | Add /biblioteca and book detail URLs |

---

## Task 1: Scaffold data directories and configure images

**Files:**
- Create: `data/library.json`
- Create: `content/library/es/.gitkeep`
- Create: `content/library/en/.gitkeep`
- Modify: `next.config.ts`

- [ ] **Step 1: Create the seed library JSON file**

Create `data/library.json`:
```json
[]
```

- [ ] **Step 2: Seed the content directories**

```bash
mkdir -p content/library/es content/library/en
touch content/library/es/.gitkeep content/library/en/.gitkeep
```

- [ ] **Step 3: Add Amazon CDN to next.config.ts image remotePatterns**

Current `next.config.ts`:
```ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {}

export default withNextIntl(nextConfig)
```

Replace with:
```ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
```

- [ ] **Step 4: Verify build compiles cleanly**

```bash
npm run build
```
Expected: exits 0, no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add data/library.json content/library/ next.config.ts
git commit -m "feat: scaffold biblioteca data dirs and configure image domains"
```

---

## Task 2: Import script

**Files:**
- Create: `scripts/import-audible.ts`

- [ ] **Step 1: Create the import script**

Create `scripts/import-audible.ts`:
```ts
import fs from 'fs'
import path from 'path'

type RawBook = Record<string, unknown>

type NormalizedBook = {
  asin: string
  title: string
  authors: string[]
  narrators: string[]
  cover_url: string
  runtime_length_min: number
  purchase_date: string
  percent_complete: number
  publisher_summary: string
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val
      .map(item =>
        typeof item === 'object' && item !== null
          ? ((item as Record<string, unknown>).name ?? (item as Record<string, unknown>).asin ?? '')
          : item
      )
      .map(String)
      .filter(Boolean)
  }
  if (typeof val === 'string' && val.trim()) {
    return val.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

function toDateString(val: unknown): string {
  if (!val) return ''
  const d = new Date(String(val))
  return isNaN(d.getTime()) ? String(val) : d.toISOString().split('T')[0]
}

function normalize(book: RawBook): NormalizedBook | null {
  if (!book.asin || !book.title) return null
  const images = book.product_images as Record<string, string> | undefined
  return {
    asin: String(book.asin),
    title: String(book.title),
    authors: toStringArray(book.authors),
    narrators: toStringArray(book.narrators),
    cover_url: String(book.cover_url ?? images?.['500'] ?? ''),
    runtime_length_min: Number(book.runtime_length_min ?? 0),
    purchase_date: toDateString(book.purchase_date),
    percent_complete: Number(book.percent_complete ?? (book.is_finished ? 100 : 0)),
    publisher_summary: String(book.publisher_summary ?? ''),
  }
}

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: npx tsx scripts/import-audible.ts <path-to-raw-library.json>')
  process.exit(1)
}

const raw: unknown = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
const items = (Array.isArray(raw) ? raw : (raw as Record<string, unknown>).items ?? []) as RawBook[]
const normalized = items.map(normalize).filter((b): b is NormalizedBook => b !== null)

const outputPath = path.join(process.cwd(), 'data/library.json')
fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2))
console.log(`✓ Imported ${normalized.length} books to data/library.json`)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/import-audible.ts
git commit -m "feat: add audible-cli import script"
```

---

## Task 3: src/lib/library.ts (TDD)

**Files:**
- Create: `src/lib/__tests__/library.test.ts`
- Create: `src/lib/library.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/library.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'fs'
import { getAllBooks, getBook, getBookAsins } from '../library'

const mockBook = {
  asin: 'B001TEST00',
  title: 'Test Book',
  authors: ['Author A'],
  narrators: ['Narrator A'],
  cover_url: 'https://m.media-amazon.com/test.jpg',
  runtime_length_min: 480,
  purchase_date: '2024-01-01',
  percent_complete: 0,
  publisher_summary: 'A test book',
}

afterEach(() => vi.restoreAllMocks())

describe('getAllBooks', () => {
  it('returns empty array when library.json does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    expect(getAllBooks('es')).toEqual([])
  })

  it('returns books with status queued and rating null when no MDX file exists', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: unknown) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([mockBook]) as unknown as Buffer)
    const books = getAllBooks('es')
    expect(books).toHaveLength(1)
    expect(books[0].status).toBe('queued')
    expect(books[0].rating).toBeNull()
  })

  it('merges status and rating from MDX frontmatter when MDX file exists', () => {
    const mdx = `---\nstatus: completed\nrating: 4\n---\n\nReview.`
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockImplementation((p: unknown) => {
      if (String(p).endsWith('library.json')) return JSON.stringify([mockBook]) as unknown as Buffer
      return mdx as unknown as Buffer
    })
    const books = getAllBooks('es')
    expect(books[0].status).toBe('completed')
    expect(books[0].rating).toBe(4)
  })
})

describe('getBook', () => {
  it('returns null when library.json does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    expect(getBook('B001TEST00', 'es')).toBeNull()
  })

  it('returns null when asin is not in library.json', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: unknown) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([]) as unknown as Buffer)
    expect(getBook('NOTEXIST', 'es')).toBeNull()
  })

  it('returns book with empty highlights and null content when no MDX file', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: unknown) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([mockBook]) as unknown as Buffer)
    const book = getBook('B001TEST00', 'es')
    expect(book).not.toBeNull()
    expect(book!.highlights).toEqual([])
    expect(book!.content).toBeNull()
    expect(book!.status).toBe('queued')
  })

  it('returns book with highlights and content from MDX when file exists', () => {
    const mdx = `---\nstatus: completed\nrating: 5\nhighlights:\n  - "Great quote"\n---\n\nMy review.`
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockImplementation((p: unknown) => {
      if (String(p).endsWith('library.json')) return JSON.stringify([mockBook]) as unknown as Buffer
      return mdx as unknown as Buffer
    })
    const book = getBook('B001TEST00', 'es')
    expect(book!.highlights).toEqual(['Great quote'])
    expect(book!.content).toContain('My review.')
    expect(book!.rating).toBe(5)
  })
})

describe('getBookAsins', () => {
  it('returns empty array when library.json does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    expect(getBookAsins()).toEqual([])
  })

  it('returns array of asins from library.json', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: unknown) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([mockBook]) as unknown as Buffer)
    expect(getBookAsins()).toEqual(['B001TEST00'])
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm run test:run -- src/lib/__tests__/library.test.ts
```
Expected: FAIL — `Cannot find module '../library'`

- [ ] **Step 3: Implement src/lib/library.ts**

Create `src/lib/library.ts`:
```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const dataPath = path.join(process.cwd(), 'data/library.json')
const contentRoot = path.join(process.cwd(), 'content/library')

export type BookStatus = 'listening' | 'completed' | 'queued' | 'abandoned'

export type BookMeta = {
  asin: string
  title: string
  authors: string[]
  narrators: string[]
  cover_url: string
  runtime_length_min: number
  purchase_date: string
  percent_complete: number
  publisher_summary: string
  status: BookStatus
  rating: number | null
}

export type Book = BookMeta & {
  highlights: string[]
  content: string | null
}

type AudibleBook = Omit<BookMeta, 'status' | 'rating'>

function readLibraryJson(): AudibleBook[] {
  if (!fs.existsSync(dataPath)) return []
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as AudibleBook[]
  } catch {
    return []
  }
}

function mergeWithMdx(book: AudibleBook, locale: string): BookMeta {
  const mdxPath = path.join(contentRoot, locale, `${book.asin}.mdx`)
  if (!fs.existsSync(mdxPath)) {
    return { ...book, status: 'queued', rating: null }
  }
  const { data } = matter(fs.readFileSync(mdxPath, 'utf-8'))
  return {
    ...book,
    status: (data.status as BookStatus) ?? 'queued',
    rating: typeof data.rating === 'number' ? data.rating : null,
  }
}

export function getAllBooks(locale: string): BookMeta[] {
  return readLibraryJson()
    .map(book => mergeWithMdx(book, locale))
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
}

export function getBook(asin: string, locale: string): Book | null {
  const book = readLibraryJson().find(b => b.asin === asin)
  if (!book) return null

  const mdxPath = path.join(contentRoot, locale, `${asin}.mdx`)
  if (!fs.existsSync(mdxPath)) {
    return { ...book, status: 'queued', rating: null, highlights: [], content: null }
  }
  const { data, content } = matter(fs.readFileSync(mdxPath, 'utf-8'))
  return {
    ...book,
    status: (data.status as BookStatus) ?? 'queued',
    rating: typeof data.rating === 'number' ? data.rating : null,
    highlights: Array.isArray(data.highlights) ? (data.highlights as string[]) : [],
    content,
  }
}

export function getBookAsins(): string[] {
  return readLibraryJson().map(b => b.asin)
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm run test:run -- src/lib/__tests__/library.test.ts
```
Expected: all 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/library.ts src/lib/__tests__/library.test.ts
git commit -m "feat: add library.ts merge logic with tests"
```

---

## Task 4: i18n keys

**Files:**
- Modify: `src/messages/es.json`
- Modify: `src/messages/en.json`

- [ ] **Step 1: Add keys to src/messages/es.json**

Add the `biblioteca` object as a top-level key (after `"recipes"`), add `"biblioteca"` to `nav`, and add `bibliotecaTitle` / `bibliotecaDescription` to `meta`:

In the `"nav"` object, add:
```json
"biblioteca": "Biblioteca"
```

In the `"meta"` object, add:
```json
"bibliotecaTitle": "Biblioteca",
"bibliotecaDescription": "Los libros y audiolibros que Sergio Monsalve está leyendo y estudiando."
```

Add new top-level key `"biblioteca"`:
```json
"biblioteca": {
  "comment": "// biblioteca",
  "title": "Biblioteca",
  "allStatuses": "todos",
  "statusListening": "leyendo",
  "statusCompleted": "completado",
  "statusQueued": "en lista",
  "statusAbandoned": "abandonado",
  "highlights": "highlights",
  "listenOnAudible": "Escuchar en Audible →",
  "empty": "no hay libros aún",
  "narrators": "narrado por",
  "duration": "duración"
}
```

- [ ] **Step 2: Add keys to src/messages/en.json**

In the `"nav"` object, add:
```json
"biblioteca": "Library"
```

In the `"meta"` object, add:
```json
"bibliotecaTitle": "Library",
"bibliotecaDescription": "Books and audiobooks Sergio Monsalve is reading and studying."
```

Add new top-level key `"biblioteca"`:
```json
"biblioteca": {
  "comment": "// library",
  "title": "Library",
  "allStatuses": "all",
  "statusListening": "listening",
  "statusCompleted": "completed",
  "statusQueued": "in queue",
  "statusAbandoned": "abandoned",
  "highlights": "highlights",
  "listenOnAudible": "Listen on Audible →",
  "empty": "no books yet",
  "narrators": "narrated by",
  "duration": "duration"
}
```

- [ ] **Step 3: Verify JSON is valid**

```bash
node -e "require('./src/messages/es.json'); require('./src/messages/en.json'); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add src/messages/es.json src/messages/en.json
git commit -m "feat: add biblioteca i18n keys"
```

---

## Task 5: StarRating component

**Files:**
- Create: `src/components/StarRating.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/StarRating.tsx`:
```tsx
export default function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return null
  return (
    <div className="flex gap-0.5 text-sm" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rating ? 'text-accent' : 'text-border'}>
          ★
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StarRating.tsx
git commit -m "feat: add StarRating component"
```

---

## Task 6: BookCard component

**Files:**
- Create: `src/components/BookCard.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/BookCard.tsx`:
```tsx
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { BookMeta, BookStatus } from '@/lib/library'
import StarRating from './StarRating'

const statusClass: Record<BookStatus, string> = {
  listening: 'text-accent',
  completed: 'text-text-secondary',
  queued: 'text-text-muted',
  abandoned: 'text-text-muted line-through',
}

export default function BookCard({
  book,
  locale,
  statusLabel,
}: {
  book: BookMeta
  locale: string
  statusLabel: string
}) {
  const hours = Math.floor(book.runtime_length_min / 60)
  const minutes = book.runtime_length_min % 60

  return (
    <Link
      href={`/biblioteca/${book.asin}`}
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

- [ ] **Step 2: Commit**

```bash
git add src/components/BookCard.tsx
git commit -m "feat: add BookCard component"
```

---

## Task 7: BookList client component

**Files:**
- Create: `src/components/BookList.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/BookList.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import BookCard from './BookCard'
import type { BookMeta, BookStatus } from '@/lib/library'

const ALL_STATUSES: BookStatus[] = ['listening', 'completed', 'queued', 'abandoned']

export default function BookList({ books, locale }: { books: BookMeta[]; locale: string }) {
  const t = useTranslations('biblioteca')
  const [activeStatus, setActiveStatus] = useState<BookStatus | null>(null)

  const statusLabel: Record<BookStatus, string> = {
    listening: t('statusListening'),
    completed: t('statusCompleted'),
    queued: t('statusQueued'),
    abandoned: t('statusAbandoned'),
  }

  const filtered = activeStatus ? books.filter(b => b.status === activeStatus) : books

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveStatus(null)}
          className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
            !activeStatus
              ? 'bg-accent text-background border-accent font-bold'
              : 'border-border text-text-secondary hover:border-accent hover:text-accent'
          }`}
        >
          {t('allStatuses')}
        </button>
        {ALL_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(activeStatus === status ? null : status)}
            className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
              activeStatus === status
                ? 'bg-accent text-background border-accent font-bold'
                : 'border-border text-text-secondary hover:border-accent hover:text-accent'
            }`}
          >
            {statusLabel[status]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">// {t('empty')}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(book => (
            <BookCard
              key={book.asin}
              book={book}
              locale={locale}
              statusLabel={statusLabel[book.status]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BookList.tsx
git commit -m "feat: add BookList client component with status filter"
```

---

## Task 8: Biblioteca list page

**Files:**
- Create: `src/app/[locale]/biblioteca/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/[locale]/biblioteca/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAllBooks } from '@/lib/library'
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
  const books = getAllBooks(locale)
  const t = await getTranslations({ locale, namespace: 'biblioteca' })

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-accent mb-2">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">{t('title')}</h1>
      <BookList books={books} locale={locale} />
    </div>
  )
}
```

- [ ] **Step 2: Start the dev server and verify the page renders**

```bash
npm run dev
```

Open `http://localhost:3000/es/biblioteca` — should show:
- `// biblioteca` in accent green
- `Biblioteca` heading
- Filter buttons: todos | leyendo | completado | en lista | abandonado
- `// no hay libros aún` (since library.json is empty)

Open `http://localhost:3000/en/biblioteca` — should show `Library` heading with English labels.

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/biblioteca/page.tsx
git commit -m "feat: add biblioteca list page"
```

---

## Task 9: Book detail page

**Files:**
- Create: `src/app/[locale]/biblioteca/[asin]/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/[locale]/biblioteca/[asin]/page.tsx`:
```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getBook, getBookAsins } from '@/lib/library'
import MDXContent from '@/components/MDXContent'
import StarRating from '@/components/StarRating'

export function generateStaticParams() {
  return getBookAsins().map(asin => ({ asin }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; asin: string }>
}): Promise<Metadata> {
  const { locale, asin } = await params
  const book = getBook(asin, locale)
  if (!book) return {}
  return {
    title: book.title,
    description: book.publisher_summary.slice(0, 160),
    alternates: { canonical: `/${locale}/biblioteca/${asin}` },
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string; asin: string }>
}) {
  const { locale, asin } = await params
  const book = getBook(asin, locale)
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

      <p className="text-xs text-text-secondary leading-relaxed mb-8">
        {book.publisher_summary}
      </p>

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

      {book.content && <MDXContent source={book.content} />}

      <a
        href={`https://www.audible.com/pd/${book.asin}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-accent hover:underline mt-8 block"
      >
        {t('listenOnAudible')}
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Test with a sample book MDX**

Create a test entry to verify the detail page works. First, add one book to `data/library.json`:
```json
[
  {
    "asin": "B00TEST001",
    "title": "Libro de prueba",
    "authors": ["Autor Prueba"],
    "narrators": ["Narrador Prueba"],
    "cover_url": "",
    "runtime_length_min": 300,
    "purchase_date": "2024-01-01",
    "percent_complete": 100,
    "publisher_summary": "Resumen del libro de prueba."
  }
]
```

Create `content/library/es/B00TEST001.mdx`:
```mdx
---
status: completed
rating: 5
highlights:
  - "Esta es una cita de prueba del libro."
---

Mi reseña personal del libro de prueba.
```

Visit `http://localhost:3000/es/biblioteca` — card should appear.
Visit `http://localhost:3000/es/biblioteca/B00TEST001` — detail page should show cover placeholder, title, rating ★★★★★, highlight in blockquote, and review text.

- [ ] **Step 3: Remove the test data and restore empty library.json**

```bash
rm content/library/es/B00TEST001.mdx
```

Restore `data/library.json` to:
```json
[]
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/biblioteca/
git commit -m "feat: add book detail page"
```

---

## Task 10: Add biblioteca to navigation

**Files:**
- Modify: `src/components/Nav.tsx`

- [ ] **Step 1: Add the link to Nav.tsx**

In `src/components/Nav.tsx`, add the biblioteca link between the Recipes and Guestbook links:

```tsx
<Link href="/biblioteca" className="text-xs text-text-secondary hover:text-text transition-colors">
  {t('biblioteca')}
</Link>
```

The full updated links section:
```tsx
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
</div>
```

- [ ] **Step 2: Verify nav renders in browser**

With dev server running, confirm "Biblioteca" (ES) / "Library" (EN) appears between Recipes and Guestbook in the nav, and clicking it navigates to `/biblioteca`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat: add biblioteca link to nav"
```

---

## Task 11: Update sitemap

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Update sitemap.ts**

Replace the contents of `src/app/sitemap.ts` with:
```ts
import type { MetadataRoute } from 'next'
import { getPostSlugs } from '@/lib/posts'
import { getRecipeSlugs } from '@/lib/recipes'
import { getBookAsins } from '@/lib/library'

const base = 'https://sergiomonsalve.com'
const locales = ['es', 'en']
const staticRoutes = ['', '/about', '/contact', '/blog', '/recipes', '/biblioteca']

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = locales.flatMap(locale =>
    staticRoutes.map(route => ({
      url: `${base}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  )

  const postEntries = locales.flatMap(locale =>
    getPostSlugs(locale).map(slug => ({
      url: `${base}/${locale}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }))
  )

  const recipeEntries = locales.flatMap(locale =>
    getRecipeSlugs(locale).map(slug => ({
      url: `${base}/${locale}/recipes/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }))
  )

  const bookEntries = locales.flatMap(locale =>
    getBookAsins().map(asin => ({
      url: `${base}/${locale}/biblioteca/${asin}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  )

  return [...staticEntries, ...postEntries, ...recipeEntries, ...bookEntries]
}
```

- [ ] **Step 2: Run full test suite to confirm nothing is broken**

```bash
npm run test:run
```
Expected: all tests PASS.

- [ ] **Step 3: Run build to confirm production build succeeds**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: add biblioteca routes to sitemap"
```

---

## Usage: updating your library

Once `audible-cli` is installed and authenticated:

```bash
# Export your Audible library
audible library export --output /tmp/raw-library.json --output-format json

# Normalize to project format
npx tsx scripts/import-audible.ts /tmp/raw-library.json

# Commit
git add data/library.json
git commit -m "chore: update audible library"
```

To add notes for a book (use its ASIN as the filename):
```bash
# Create/edit the MDX file
touch content/library/es/B00EXAMPLE.mdx
```

```mdx
---
status: completed
rating: 4
highlights:
  - "Una cita memorable del libro."
---

Mi reseña personal aquí.
```
