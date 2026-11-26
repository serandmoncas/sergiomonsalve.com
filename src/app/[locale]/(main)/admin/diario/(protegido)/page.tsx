import { NextResponse } from 'next/server'
import { notFound } from 'next/navigation'
import { requireAdminAal2 } from '@/lib/auth/admin'
import OtroAutenticador from '@/components/admin/diario/OtroAutenticador'

export const dynamic = 'force-dynamic'

export default async function DiarioPage({ params }: { params: Promise<{ locale: string }> }) {
  // Además del proxy, se vuelve a exigir aal2 en el servidor (DI-083).
  if ((await requireAdminAal2()) instanceof NextResponse) notFound()
  const { locale } = await params
  const idioma = locale === 'en' ? 'en' : 'es'

  return (
    <div>
      <p className="font-mono text-xs text-accent mb-2">{'//'} diario</p>
      <h1 className="text-2xl font-extrabold text-text mb-8">Diario</h1>
      <OtroAutenticador destino={`/${idioma}/admin/diario`} />
    </div>
  )
}
