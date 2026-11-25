import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { normalizeEmail } from '@/lib/manual/access'
import { createAdminClient } from '@/lib/supabase/server'
import { sendManualInvitation } from '@/lib/resend'

const inviteSchema = z.object({
  email: z.string().transform(normalizeEmail).pipe(z.string().email()),
  name: z.string().trim().min(1).max(80),
  note: z.string().trim().max(500).optional(),
})

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { data, error } = await createAdminClient()
    .from('manual_readers')
    .select('email, name, note, invited_at')
    .order('invited_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  return NextResponse.json({ readers: data })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const body = await request.json().catch(() => null)
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const { email, name, note } = parsed.data

  const admin = createAdminClient()
  const { error: upsertError } = await admin
    .from('manual_readers')
    .upsert({ email, name, note: note || null }, { onConflict: 'email' })
  if (upsertError) return NextResponse.json({ error: 'Failed to save' }, { status: 500 })

  // Cuenta de Supabase: si ya existe, está bien. La invitación va por nuestro correo,
  // no por inviteUserByEmail (sus enlaces implícitos no los maneja /auth/callback).
  const { error: cuentaError } = await admin.auth.admin.createUser({ email, email_confirm: true })
  let existed = false
  if (cuentaError) {
    const e = cuentaError as { message?: string; code?: string }
    if (e.code === 'email_exists' || /already (been )?registered/i.test(e.message ?? '')) {
      existed = true
    } else {
      // El lector queda guardado; se puede reintentar.
      console.error('[manual] fallo al crear la cuenta:', e.message)
      return NextResponse.json({ invited: false, error: 'cuenta' })
    }
  }

  try {
    await sendManualInvitation({ to: email, name })
  } catch (e) {
    console.error('[manual] fallo al enviar la invitación:', e instanceof Error ? e.message : e)
    return NextResponse.json({ invited: false, error: 'correo' })
  }
  return NextResponse.json({ invited: true, existed })
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const raw = new URL(request.url).searchParams.get('email')
  const email = raw ? normalizeEmail(raw) : ''
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const { error } = await createAdminClient().from('manual_readers').delete().eq('email', email)
  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  return NextResponse.json({ success: true })
}
