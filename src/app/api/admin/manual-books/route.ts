import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).default([]),
  cover_url: z.string().default(''),
  description: z.string().default(''),
  source_type: z.enum(['physical', 'ebook', 'other']).default('physical'),
  isbn: z.string().optional(),
  published_year: z.number().int().min(1000).max(2100).optional(),
})

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

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
