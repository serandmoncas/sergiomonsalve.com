import { cache } from 'react'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/auth/admin'

export type Reader = { userId: string; email: string; name: string; isAdmin: boolean }

export function normalizeEmail(e: string): string {
  return e.trim().toLowerCase()
}

/** Lector actual del manual: admin o correo invitado. null si no tiene acceso. */
export async function getReader(): Promise<Reader | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const email = normalizeEmail(user.email)

  if (isAdminEmail(email)) {
    return { userId: user.id, email, name: process.env.ADMIN_NAME ?? 'Sergio', isAdmin: true }
  }

  // La tabla solo se lee con service role (RLS sin políticas).
  const { data, error } = await createAdminClient()
    .from('manual_readers')
    .select('name')
    .eq('email', email)
    .maybeSingle()
  if (error) console.error('[manual] no se pudo consultar manual_readers:', error.message)
  if (!data) return null

  return { userId: user.id, email, name: data.name, isAdmin: false }
}

/** Igual que getReader, pero una sola consulta por petición (cache de React). */
export const requireReader = cache(async (): Promise<Reader | null> => getReader())
