import { mes as mesDelNucleo } from '@/lib/diaria'
import { leerDiario } from '@/lib/diario/acceso'
import { fechaBogota, mesDe } from '@/lib/diario/fecha'
import Calendario from '@/components/admin/diario/Calendario'
import NavDiario from '@/components/admin/diario/NavDiario'
import NoDisponible from '@/components/admin/diario/NoDisponible'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage({ params, searchParams }: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ mes?: string | string[] }>
}) {
  const r = await leerDiario()
  const { locale } = await params
  const idioma = locale === 'en' ? 'en' : 'es'
  const hoy = fechaBogota(new Date())
  const mes = mesDe((await searchParams).mes, hoy)

  return (
    <div>
      <p className="font-mono text-xs text-accent mb-2">{'//'} diario</p>
      <h1 className="text-2xl font-extrabold text-text mb-4">Calendario</h1>
      <NavDiario locale={idioma} notaHoy={r.ok ? r.boveda.diarias.get(hoy)?.ruta : null} />
      {r.ok ? (
        <Calendario
          mes={mes}
          hoy={hoy}
          locale={idioma}
          dias={mesDelNucleo(r.boveda.diarias, mes).map(d => ({ ...d, ruta: r.boveda.diarias.get(d.dia)?.ruta ?? null }))}
        />
      ) : (
        <NoDisponible />
      )}
    </div>
  )
}
