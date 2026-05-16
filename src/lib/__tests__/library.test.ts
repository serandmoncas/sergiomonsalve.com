/* eslint-disable @typescript-eslint/no-explicit-any */
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
    vi.spyOn(fs, 'existsSync').mockImplementation((p: any) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([mockBook]) as any)
    const books = getAllBooks('es')
    expect(books).toHaveLength(1)
    expect(books[0].status).toBe('queued')
    expect(books[0].rating).toBeNull()
  })

  it('merges status and rating from MDX frontmatter when MDX file exists', () => {
    const mdx = `---\nstatus: completed\nrating: 4\n---\n\nReview.`
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockImplementation((p: any) => {
      if (String(p).endsWith('library.json')) return JSON.stringify([mockBook])
      return mdx
    })
    const books = getAllBooks('es')
    expect(books[0].status).toBe('completed')
    expect(books[0].rating).toBe(4)
  })

  it('sorts books by purchase_date descending', () => {
    const older = { ...mockBook, asin: 'B001OLD', purchase_date: '2023-01-01' }
    const newer = { ...mockBook, asin: 'B001NEW', purchase_date: '2024-06-01' }
    vi.spyOn(fs, 'existsSync').mockImplementation((p: any) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([older, newer]) as any)
    const books = getAllBooks('es')
    expect(books[0].asin).toBe('B001NEW')
    expect(books[1].asin).toBe('B001OLD')
  })

  it('returns empty array when library.json contains invalid JSON', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockReturnValue('not-valid-json' as any)
    expect(getAllBooks('es')).toEqual([])
  })
})

describe('getBook', () => {
  it('returns null when library.json does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    expect(getBook('B001TEST00', 'es')).toBeNull()
  })

  it('returns null when asin is not in library.json', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: any) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([]) as any)
    expect(getBook('NOTEXIST', 'es')).toBeNull()
  })

  it('returns book with empty highlights and null content when no MDX file', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: any) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([mockBook]) as any)
    const book = getBook('B001TEST00', 'es')
    expect(book).not.toBeNull()
    expect(book!.highlights).toEqual([])
    expect(book!.content).toBeNull()
    expect(book!.status).toBe('queued')
  })

  it('returns book with highlights and content from MDX when file exists', () => {
    const mdx = `---\nstatus: completed\nrating: 5\nhighlights:\n  - "Great quote"\n---\n\nMy review.`
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockImplementation((p: any) => {
      if (String(p).endsWith('library.json')) return JSON.stringify([mockBook])
      return mdx
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
    vi.spyOn(fs, 'existsSync').mockImplementation((p: any) =>
      String(p).endsWith('library.json')
    )
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([mockBook]) as any)
    expect(getBookAsins()).toEqual(['B001TEST00'])
  })
})
