import 'server-only'
import { NextResponse } from 'next/server'
import { notFound } from 'next/navigation'
import { requireAdminAal2 } from '@/lib/auth/admin'
import { obtenerBoveda, type ResultadoBoveda } from './boveda'

/**
 * La única forma en que una página lee el diario (DI-084): exige sesión de
 * administrador con segundo factor en cada pedido. Los layouts no se vuelven a
 * ejecutar al navegar entre páginas, así que la comprobación vive aquí.
 */
export async function leerDiario(): Promise<ResultadoBoveda> {
  if ((await requireAdminAal2()) instanceof NextResponse) notFound()
  return obtenerBoveda()
}
