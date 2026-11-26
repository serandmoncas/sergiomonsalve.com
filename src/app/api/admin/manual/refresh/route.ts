import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'

/** Invalida la caché del contenido del manual (tag 'manual'). */
export async function POST() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  // Next 16 exige perfil; expire:0 expira de inmediato.
  revalidateTag('manual', { expire: 0 })
  return NextResponse.json({ success: true })
}
