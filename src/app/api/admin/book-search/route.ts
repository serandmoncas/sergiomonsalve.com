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
