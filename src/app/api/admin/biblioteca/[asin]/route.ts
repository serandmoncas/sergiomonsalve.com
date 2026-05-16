import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  visible: z.boolean().optional(),
  status: z.enum(['listening', 'completed', 'queued', 'abandoned']).optional(),
}).refine(
  data => data.visible !== undefined || data.status !== undefined,
  { message: 'At least one of visible or status is required' }
)

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ asin: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
