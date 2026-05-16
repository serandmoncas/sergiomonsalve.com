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
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]
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
    runtime_length_min: Number(book.runtime_length_min ?? 0) || 0,
    purchase_date: toDateString(book.purchase_date),
    percent_complete: Math.min(100, Math.max(0, Number(book.percent_complete ?? (book.is_finished ? 100 : 0)) || 0)),
    publisher_summary: String(book.publisher_summary ?? ''),
  }
}

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: npx tsx scripts/import-audible.ts <path-to-raw-library.json>')
  process.exit(1)
}

try {
  const raw: unknown = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  const items = (Array.isArray(raw) ? raw : (raw as Record<string, unknown>).items ?? []) as RawBook[]
  const normalized = items.map(normalize).filter((b): b is NormalizedBook => b !== null)

  const outputPath = path.join(process.cwd(), 'data/library.json')
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2))
  console.log(`✓ Imported ${normalized.length} books to data/library.json`)
} catch (err) {
  console.error(`Error reading or parsing: ${inputPath}`)
  process.exit(1)
}
