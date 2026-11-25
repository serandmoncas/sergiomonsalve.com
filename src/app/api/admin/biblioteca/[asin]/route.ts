import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  visible: z.boolean().optional(),
  status: z.enum(['listening', 'completed', 'queued', 'abandoned']).optional(),
}).refine(
  data => data.visible !== undefined || data.status !== undefined,
  { message: 'At least one of visible or status is required' }
)

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ asin: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { asin } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('library_books')
    .select('visible, status')
    .eq('asin', asin)
    .maybeSingle()

  const upsertData = {
    asin,
    visible: parsed.data.visible ?? existing?.visible ?? true,
    status: parsed.data.status ?? existing?.status ?? 'queued',
    updated_at: new Date().toISOString(),
  }

  const { error } = await admin.from('library_books').upsert(upsertData)
  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  return NextResponse.json({ asin, visible: upsertData.visible, status: upsertData.status })
}
