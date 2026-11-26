import { decodificar } from '@/lib/diaria'
import { leerDiario } from '@/lib/diario/acceso'
import { fechaBogota } from '@/lib/diario/fecha'
import NavDiario from '@/components/admin/diario/NavDiario'
import NoDisponible from '@/components/admin/diario/NoDisponible'
import NotaMarkdown from '@/components/admin/diario/NotaMarkdown'
import { enlazar } from '@/lib/diario/enlazar'

export const dynamic = 'force-dynamic'

const titulo = (ruta: string) => ruta.split('/').pop()!.replace(/\.md$/i, '')

export default async function NotaPage({ params, searchParams }: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ n?: string | string[] }>
}) {
  const r = await leerDiario()
  const { locale } = await params
  const idioma = locale === 'en' ? 'en' : 'es'
  const { n } = await searchParams
  if (!r.ok) return <NoDisponible />

  const b = r.boveda
  const nav = <NavDiario locale={idioma} notaHoy={b.diarias.get(fechaBogota(new Date()))?.ruta} />
  // Solo ids de notas del índice: nada de rutas, "../" ni adjuntos.
  const ruta = typeof n === 'string' ? b.porId.get(n) : undefined
  const datos = ruta ? b.fs.leer(ruta) : null
  let texto: string | null = null
  if (datos) {
    try {
      texto = decodificar(datos)
    } catch {
      texto = null
    }
  }
  if (typeof ruta !== 'string' || texto === null)
    return <div>{nav}<p className="text-text-secondary">Nota no encontrada.</p></div>

  return (
    <article>
      {nav}
      <p className="font-mono text-xs text-text-secondary mb-1">{ruta}</p>
      <h1 className="text-2xl font-extrabold text-text mb-6">{titulo(ruta)}</h1>
      <NotaMarkdown markdown={enlazar(texto, ruta, b.resolutor, idioma)} />
    </article>
  )
}
