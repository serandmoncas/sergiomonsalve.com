import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const patchSchema = z.object({
  visible: z.boolean().optional(),
  status: z.enum(['listening', 'completed', 'queued', 'abandoned']).optional(),
}).refine(d => d.visible !== undefined || d.status !== undefined, {
  message: 'At least one field required',
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('manual_books').select('visible, status').eq('id', id).maybeSingle()

  const update = {
    visible: parsed.data.visible ?? existing?.visible ?? true,
    status: parsed.data.status ?? existing?.status ?? 'queued',
  }

  const { error } = await admin.from('manual_books').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  return NextResponse.json({ id, ...update })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const admin = createAdminClient()

  await admin.from('book_notes').delete().eq('book_id', id)
  const { error } = await admin.from('manual_books').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })

  return NextResponse.json({ success: true })
}
