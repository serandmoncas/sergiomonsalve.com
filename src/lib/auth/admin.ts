import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { CABECERAS_DIARIO } from './cabeceras-diario'

/** Correos de administrador (variable ADMIN_EMAILS, separados por comas). */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return adminEmails().includes(email.trim().toLowerCase())
}

/** 401 sin sesión, 403 si la sesión no es de un administrador. */
export async function requireAdmin(): Promise<{ user: User } | NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return { user }
}

/**
 * Para /api/admin/diario/* (DI-083): exige sesión de administrador con
 * segundo factor (aal2). Cualquier otro caso, incluido un error de Supabase,
 * responde 404 sin cuerpo, para no revelar que la ruta existe.
 */
export async function requireAdminAal2(): Promise<{ user: User } | NextResponse> {
  const negado = () => new NextResponse(null, { status: 404, headers: CABECERAS_DIARIO })
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminEmail(user.email)) return negado()
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error || data?.currentLevel !== 'aal2') return negado()
    return { user }
  } catch {
    return negado()
  }
}
