import { notFound } from 'next/navigation'
import { getReader } from '@/lib/manual/access'
import { getManual } from '@/lib/manual/manual'
import ManualAdmin from '@/components/admin/ManualAdmin'

export const dynamic = 'force-dynamic'

export default async function AdminManualPage() {
  // Además del proxy, se vuelve a comprobar el rol en el servidor.
  const reader = await getReader()
  if (!reader?.isAdmin) notFound()

  const result = await getManual()
  const contenido = result.ok
    ? { ok: true as const, rotas: result.manual.rotas, huerfanas: result.manual.huerfanas }
    : { ok: false as const }

  return <ManualAdmin contenido={contenido} />
}
