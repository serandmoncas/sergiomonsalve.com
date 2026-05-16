import fs from 'fs'
import path from 'path'

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

// ── CSV parser (no external deps) ──────────────────────────────────────────

function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < content.length) {
    const ch = content[i]
    if (inQuotes) {
      if (ch === '"' && content[i + 1] === '"') {
        field += '"'
        i += 2
        continue
      } else if (ch === '"') {
        inQuotes = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        row.push(field)
        field = ''
      } else if (ch === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else if (ch !== '\r') {
        field += ch
      }
    }
    i++
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// ── Helpers ────────────────────────────────────────────────────────────────

function stripSheetPrefix(val: string): string {
  return val.startsWith("'") ? val.slice(1) : val
}

// "7h 46min." → 466, "46min." → 46, "7h" → 420
function parseDurationToMinutes(val: string): number {
  const s = stripSheetPrefix(val).replace(/\.$/, '').trim()
  const hMatch = s.match(/(\d+)h/)
  const mMatch = s.match(/(\d+)\s*min/)
  const h = hMatch ? parseInt(hMatch[1], 10) : 0
  const m = mMatch ? parseInt(mMatch[1], 10) : 0
  return h * 60 + m
}

// "Terminado" → 100, "'4h 2min. restantes" → computed from total
function parseProgress(progressVal: string, totalMin: number): number {
  const s = stripSheetPrefix(progressVal).trim()
  if (!s || s === '') return 0
  if (s.toLowerCase().includes('terminado')) return 100
  if (s.includes('restantes')) {
    const remainingMin = parseDurationToMinutes(s.replace('restantes', '').trim())
    if (totalMin <= 0 || remainingMin <= 0) return 0
    return Math.min(100, Math.max(0, Math.round((1 - remainingMin / totalMin) * 100)))
  }
  return 0
}

function extractImageUrl(formula: string): string {
  const m = formula.match(/IMAGE\("([^"]+)"/)
  return m ? m[1].replace('_SL75_', '_SL500_') : ''
}

function extractHyperlinkText(formula: string): string {
  // =HYPERLINK("url"; "Title text")
  const m = formula.match(/HYPERLINK\([^;]+;\s*"([^"]+)"\)/)
  return m ? m[1] : stripSheetPrefix(formula)
}

function splitNames(val: string): string[] {
  if (!val || !val.trim()) return []
  return val.split(',').map(s => s.trim()).filter(Boolean)
}

// ── CSV column indices (ALE format) ────────────────────────────────────────
const COL = {
  cover: 1,
  title: 5,
  blurb: 9,
  authors: 10,
  narrators: 11,
  length: 16,
  progress: 17,
  releaseDate: 18,
  asin: 33,
  summary: 36,
}

function normalizeCsvRow(row: string[]): NormalizedBook | null {
  const asin = stripSheetPrefix(row[COL.asin] ?? '').trim()
  const title = extractHyperlinkText(row[COL.title] ?? '')
  if (!asin || !title) return null

  const totalMin = parseDurationToMinutes(row[COL.length] ?? '')
  const summary = (row[COL.summary] ?? row[COL.blurb] ?? '').trim()

  return {
    asin,
    title,
    authors: splitNames(row[COL.authors] ?? ''),
    narrators: splitNames(row[COL.narrators] ?? ''),
    cover_url: extractImageUrl(row[COL.cover] ?? ''),
    runtime_length_min: totalMin,
    purchase_date: (row[COL.releaseDate] ?? '').trim(),
    percent_complete: parseProgress(row[COL.progress] ?? '', totalMin),
    publisher_summary: stripSheetPrefix(summary),
  }
}

// ── JSON path (original) ───────────────────────────────────────────────────

type RawBook = Record<string, unknown>

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

function normalizeJsonBook(book: RawBook): NormalizedBook | null {
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

// ── Main ───────────────────────────────────────────────────────────────────

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: npx tsx scripts/import-audible.ts <path-to-library.json|.csv>')
  process.exit(1)
}

try {
  const content = fs.readFileSync(inputPath, 'utf-8')
  const ext = path.extname(inputPath).toLowerCase()

  let normalized: NormalizedBook[]

  if (ext === '.csv') {
    const [, ...dataRows] = parseCsv(content)
    normalized = dataRows
      .map(normalizeCsvRow)
      .filter((b): b is NormalizedBook => b !== null)
  } else {
    const raw: unknown = JSON.parse(content)
    const items = (Array.isArray(raw) ? raw : (raw as Record<string, unknown>).items ?? []) as RawBook[]
    normalized = items
      .map(normalizeJsonBook)
      .filter((b): b is NormalizedBook => b !== null)
  }

  const outputPath = path.join(process.cwd(), 'data/library.json')
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2))
  console.log(`✓ Imported ${normalized.length} books to data/library.json`)
} catch (err) {
  console.error(`Error reading or parsing: ${inputPath}`)
  if (err instanceof Error) console.error(err.message)
  process.exit(1)
}
