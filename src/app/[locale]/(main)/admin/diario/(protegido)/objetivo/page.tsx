import { decodificar, vistaObjetivo } from '@/lib/diaria'
import { leerDiario } from '@/lib/diario/acceso'
import { fechaBogota } from '@/lib/diario/fecha'
import { objetivosActivos } from '@/lib/diario/objetivo'
import NavDiario from '@/components/admin/diario/NavDiario'
import NoDisponible from '@/components/admin/diario/NoDisponible'
import VistaObjetivo from '@/components/admin/diario/VistaObjetivo'

export const dynamic = 'force-dynamic'

export default async function ObjetivoPage({ params }: { params: Promise<{ locale: string }> }) {
  const r = await leerDiario()
  const { locale } = await params
  const idioma = locale === 'en' ? 'en' : 'es'
  const hoy = fechaBogota(new Date())
  const leer = (ruta: string) => {
    if (!r.ok) return ''
    const datos = r.boveda.fs.leer(ruta)
    return datos ? decodificar(datos) : ''
  }

  return (
    <div>
      <p className="font-mono text-xs text-accent mb-2">{'//'} diario · {hoy}</p>
      <h1 className="text-2xl font-extrabold text-text mb-4">Objetivo</h1>
      <NavDiario locale={idioma} notaHoy={r.ok ? r.boveda.diarias.get(hoy)?.ruta : null} />
      {r.ok ? (
        <VistaObjetivo
          objetivos={objetivosActivos(r.boveda).map(o => ({
            id: o.id,
            vista: vistaObjetivo(o.nombre, leer(o.rutaNota), leer(o.rutaContactos), hoy, hoy),
          }))}
        />
      ) : (
        <NoDisponible />
      )}
    </div>
  )
}
