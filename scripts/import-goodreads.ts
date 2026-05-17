/**
 * Import Goodreads CSV export into the manual_books (and optionally book_notes) Supabase tables.
 *
 * Usage:
 *   npx tsx scripts/import-goodreads.ts /path/to/goodreads_library_export.csv
 *
 * How to get the CSV:
 *   goodreads.com → My Books → Tools → Import and Export → Export Library
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// ── Load .env.local ──────────────────────────────────────────────────────────

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match) process.env[match[1]] ??= match[2].replace(/^"|"$/g, '')
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ── CSV parser (handles quoted fields with commas and newlines) ───────────────

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') inQuotes = false
      else field += ch
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { fields.push(field); field = '' }
      else field += ch
    }
  }
  fields.push(field)
  return fields
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? '').trim()]))
  })
}

// ── Goodreads → internal types ───────────────────────────────────────────────

// Goodreads exports ISBN as ="1234567890" — strip the =", " wrappers
function cleanIsbn(raw: string): string {
  return raw.replace(/^="?|"?$/g, '').trim()
}

function mapStatus(shelf: string): string {
  if (shelf === 'read') return 'completed'
  if (shelf === 'currently-reading') return 'listening'
  return 'queued'
}

function coverUrl(isbn13: string, isbn10: string): string {
  const isbn = isbn13 || isbn10
  if (!isbn) return ''
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
}

// ── Types ─────────────────────────────────────────────────────────────────────

type BookRecord = {
  title: string
  authors: string[]
  cover_url: string
  description: string
  source_type: 'physical'
  isbn: string | undefined
  published_year: number | undefined
  visible: boolean
  status: string
}

type NoteRecord = {
  book_id: string
  rating: number | null
  highlights: string[]
  review_md: string
}

// ── Main ──────────────────────────��────────────────────��─────────────────────

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: npx tsx scripts/import-goodreads.ts <path-to-goodreads_export.csv>')
  process.exit(1)
}

async function main() {
try {
  const raw = fs.readFileSync(inputPath, 'utf-8')
  const rows = parseCsv(raw)

  console.log(`Parsed ${rows.length} rows from CSV`)

  let inserted = 0
  let skipped = 0
  const noteRecords: NoteRecord[] = []

  for (const row of rows) {
    const title = row['Title']?.trim()
    if (!title) { skipped++; continue }

    const author = row['Author']?.trim() ?? ''
    const additionalAuthors = row['Additional Authors']?.trim() ?? ''
    const allAuthors = [author, ...additionalAuthors.split(',').map(a => a.trim())]
      .filter(Boolean)

    const isbn13 = cleanIsbn(row['ISBN13'] ?? '')
    const isbn10 = cleanIsbn(row['ISBN'] ?? '')
    const isbn = isbn13 || isbn10 || undefined

    const yearStr = row['Original Publication Year'] || row['Year Published'] || ''
    const year = yearStr ? parseInt(yearStr) : undefined

    const rating = parseInt(row['My Rating'] ?? '0')
    const myReview = (row['My Review'] ?? '').trim()
    const shelf = row['Exclusive Shelf'] ?? 'to-read'

    const book: BookRecord = {
      title,
      authors: allAuthors,
      cover_url: coverUrl(isbn13, isbn10),
      description: '',
      source_type: 'physical',
      isbn: isbn,
      published_year: year && !isNaN(year) ? year : undefined,
      visible: true,
      status: mapStatus(shelf),
    }

    const { data, error } = await supabase
      .from('manual_books')
      .insert(book)
      .select('id')
      .single()

    if (error) {
      console.error(`  ✗ Error inserting "${title}": ${error.message}`)
      skipped++
      continue
    }

    inserted++
    console.log(`  ✓ ${title}`)

    // Save notes if there's a rating or review
    if ((rating >= 1 && rating <= 5) || myReview) {
      noteRecords.push({
        book_id: data.id,
        rating: rating >= 1 && rating <= 5 ? rating : null,
        highlights: [],
        review_md: myReview,
      })
    }
  }

  // Insert notes in batch
  if (noteRecords.length > 0) {
    const { error: notesError } = await supabase.from('book_notes').insert(noteRecords)
    if (notesError) {
      console.error(`Warning: failed to insert some notes: ${notesError.message}`)
    } else {
      console.log(`\n✓ Inserted ${noteRecords.length} ratings/reviews into book_notes`)
    }
  }

  console.log(`\n✓ Done: ${inserted} books imported, ${skipped} skipped`)
} catch (err) {
  console.error(`Error reading file: ${inputPath}`)
  console.error(err)
  process.exit(1)
}
}

main()
