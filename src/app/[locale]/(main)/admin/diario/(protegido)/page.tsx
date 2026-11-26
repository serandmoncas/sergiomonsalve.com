import { vistaHoy } from '@/lib/diaria'
import { leerDiario } from '@/lib/diario/acceso'
import { fechaBogota } from '@/lib/diario/fecha'
import OtroAutenticador from '@/components/admin/diario/OtroAutenticador'
import NavDiario from '@/components/admin/diario/NavDiario'
import NoDisponible from '@/components/admin/diario/NoDisponible'
import VistaHoy from '@/components/admin/diario/VistaHoy'

export const dynamic = 'force-dynamic'

export default async function DiarioPage({ params }: { params: Promise<{ locale: string }> }) {
  const r = await leerDiario()
  const { locale } = await params
  const idioma = locale === 'en' ? 'en' : 'es'
  const hoy = fechaBogota(new Date())
  const vista = r.ok ? vistaHoy(r.boveda.diarias, r.boveda.historial, r.boveda.rutinas, hoy) : null

  return (
    <div>
      <p className="font-mono text-xs text-accent mb-2">{'//'} diario · {hoy}</p>
      <h1 className="text-2xl font-extrabold text-text mb-4">Diario</h1>
      <NavDiario locale={idioma} notaHoy={vista?.notaHoy} />
      {vista ? <VistaHoy vista={vista} locale={idioma} /> : <NoDisponible />}
      <div className="mt-12">
        <OtroAutenticador destino={`/${idioma}/admin/diario`} />
      </div>
    </div>
  )
}
