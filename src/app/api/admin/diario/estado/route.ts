import { NextResponse } from 'next/server'
import { requireAdminAal2 } from '@/lib/auth/admin'
import { CABECERAS_DIARIO } from '@/lib/auth/cabeceras-diario'

export const dynamic = 'force-dynamic'

/** Ruta de prueba del diario (DI-083): responde solo con aal2. */
export async function GET() {
  const acceso = await requireAdminAal2()
  if (acceso instanceof NextResponse) return acceso
  return NextResponse.json({ ok: true }, { headers: CABECERAS_DIARIO })
}
