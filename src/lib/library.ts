import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const dataPath = path.join(process.cwd(), 'data/library.json')
const contentRoot = path.join(process.cwd(), 'content/library')

export type BookStatus = 'listening' | 'completed' | 'queued' | 'abandoned'

const VALID_STATUSES: BookStatus[] = ['listening', 'completed', 'queued', 'abandoned']

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
    status: VALID_STATUSES.includes(data.status as BookStatus) ? (data.status as BookStatus) : 'queued',
    rating: typeof data.rating === 'number' && data.rating >= 1 && data.rating <= 5 ? data.rating : null,
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
    status: VALID_STATUSES.includes(data.status as BookStatus) ? (data.status as BookStatus) : 'queued',
    rating: typeof data.rating === 'number' && data.rating >= 1 && data.rating <= 5 ? data.rating : null,
    highlights: Array.isArray(data.highlights) ? (data.highlights as string[]) : [],
    content,
  }
}

export function getBookAsins(): string[] {
  return readLibraryJson().map(b => b.asin)
}
