import { Link } from '@/i18n/navigation'
import { avisoManual } from '@/components/manual/EstadoManual'
import { getManualForReader } from '@/lib/manual/lector'
import { notaHref, recorridoHref } from '@/lib/manual/paths'
import type { Entrada } from '@/lib/manual/types'
import { getTranslations } from 'next-intl/server'

function Contenido({ e }: { e: Entrada }) {
  // En los momentos se ve primero la puerta y el título queda en pequeño.
  if (e.puerta) {
    return (
      <>
        <span className="font-mono text-xs text-text-muted mr-3">{e.n}</span>
        <span className="text-text">{e.puerta}</span>
        <span className="block text-xs text-text-muted pl-7">{e.titulo}</span>
      </>
    )
  }
  return (
    <>
      <span className="font-mono text-xs text-text-muted mr-3">{e.n}</span>
      <span>{e.titulo}</span>
    </>
  )
}

export default async function MapaPage() {
  const res = await getManualForReader()
  if (!res.ok) return avisoManual(res)
  const t = await getTranslations('manual')
  const { indice } = res.manual

  return (
    <div className="max-w-[68ch] mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold text-text mb-8">{t('mapa.titulo')}</h1>
      {(indice?.secciones ?? []).map((s) => (
        <section key={s.id} className="mb-8">
          <h2 className="font-mono text-xs text-accent mb-3">{s.titulo}</h2>
          <ul className="space-y-2">
            {s.entradas.map((e) => {
              const href = e.nota ? notaHref(e.nota) : e.recorrido ? recorridoHref(e.recorrido) : null
              return (
                <li key={e.n}>
                  {href ? (
                    <Link href={href} className="block hover:text-accent"><Contenido e={e} /></Link>
                  ) : (
                    <span data-apagada className="block text-text-muted opacity-60"><Contenido e={e} /></span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
