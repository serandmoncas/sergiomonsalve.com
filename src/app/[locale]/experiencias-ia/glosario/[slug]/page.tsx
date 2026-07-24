// src/app/[locale]/experiencias-ia/glosario/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { GLOSARIO, getTermino } from '@/lib/experiencias-ia/glosario'
import { getSesion } from '@/lib/experiencias-ia/data'

export function generateStaticParams() {
  return GLOSARIO.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const termino = getTermino(slug)
  if (!termino) return {}
  return {
    title: `${termino.termino} — Glosario — Experiencias IA`,
    description: termino.definicion,
  }
}

export default async function TerminoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const termino = getTermino(slug)
  if (!termino) notFound()

  const sesion = termino.sesionOrigen ? getSesion(termino.sesionOrigen) : undefined

  return (
    <div>
      <p className="eyebrow">Glosario</p>
      <h1>{termino.termino}</h1>
      <p>{termino.definicion}</p>

      {termino.ejemplo && (
        <div className="side-box">
          <h4>Ejemplo</h4>
          <p>{termino.ejemplo}</p>
        </div>
      )}

      {termino.referencia && (
        <div className="side-box">
          <h4>Referencia</h4>
          <p>
            <a href={termino.referencia.url} target="_blank" rel="noopener noreferrer">
              {termino.referencia.titulo}
            </a>
          </p>
        </div>
      )}

      {sesion && (
        <p>
          <Link href={`/experiencias-ia/sesiones/${sesion.n}`} className="pendiente-origen">
            Sesión {sesion.n}: {sesion.titulo}
          </Link>
        </p>
      )}

      <div className="ses-nav">
        <Link href="/experiencias-ia/glosario">← Glosario</Link>
        <span />
      </div>
    </div>
  )
}
