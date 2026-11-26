import { NextResponse } from 'next/server'
import { notFound } from 'next/navigation'
import { requireAdminAal2 } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

/**
 * Toda página del diario (salvo segundo-factor, fuera de este grupo) exige
 * aal2 en el servidor, aunque el proxy no se ejecute (rutas con punto,
 * codificaciones raras). DI-083.
 */
export default async function ProtegidoLayout({ children }: { children: React.ReactNode }) {
  if ((await requireAdminAal2()) instanceof NextResponse) notFound()
  return <>{children}</>
}
