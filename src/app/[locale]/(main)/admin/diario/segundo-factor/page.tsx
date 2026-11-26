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
  const { locale } = await params
  const { next } = await searchParams
  const destino = destinoDiario(typeof next === 'string' ? next : null, locale)
  return <SegundoFactor modo="entrar" destino={destino} />
}
