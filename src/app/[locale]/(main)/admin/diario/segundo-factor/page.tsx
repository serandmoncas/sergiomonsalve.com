import { NextResponse } from 'next/server'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/admin'
import SegundoFactor from '@/components/admin/diario/SegundoFactor'
import { destinoDiario } from '@/lib/auth/destino-diario'

export const dynamic = 'force-dynamic'

export default async function SegundoFactorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string | string[] }>
}) {
  // Solo para administradores con sesión, aunque el proxy no se ejecute.
  if ((await requireAdmin()) instanceof NextResponse) notFound()
  const { locale } = await params
  const { next } = await searchParams
  const destino = destinoDiario(typeof next === 'string' ? next : null, locale)
  return <SegundoFactor modo="entrar" destino={destino} />
}
