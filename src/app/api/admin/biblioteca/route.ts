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
    admin.from('manual_books').select('id, title, authors, cover_url, visible, status, source_type'),
  ])

  if (overridesResult.error || manualResult.error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  const overrideMap = new Map((overridesResult.data ?? []).map(r => [r.asin, r]))

  // Admin uses 'es' locale — book titles/authors are locale-agnostic in current data
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
