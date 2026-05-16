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
