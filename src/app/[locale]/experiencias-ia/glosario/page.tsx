import type { Metadata } from 'next'
import { CATEGORIAS, ORDEN_CATEGORIAS, getTerminosPorCategoria } from '@/lib/experiencias-ia/glosario'
import TerminoRow from '@/components/experiencias-ia/TerminoRow'

export const metadata: Metadata = {
  title: 'Glosario — Experiencias IA',
}

export default function GlosarioIndexPage() {
  return (
    <div>
      <p className="eyebrow">40 términos</p>
      <h1>Glosario</h1>
      {ORDEN_CATEGORIAS.map(categoria => (
        <div key={categoria}>
          <h2 style={{ marginTop: 40 }}>{CATEGORIAS[categoria]}</h2>
          <div className="ses-list">
            {getTerminosPorCategoria(categoria).map(termino => (
              <TerminoRow key={termino.slug} termino={termino} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
