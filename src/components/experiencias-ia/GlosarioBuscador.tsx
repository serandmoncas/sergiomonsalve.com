'use client'

import { useState } from 'react'
import { coincide, type ModoBusqueda } from '@/lib/experiencias-ia/buscar'
import {
  CATEGORIAS,
  ORDEN_CATEGORIAS,
  type TerminoGlosario,
} from '@/lib/experiencias-ia/glosario'
import TerminoRow from './TerminoRow'

const MODOS: Array<{ value: ModoBusqueda; label: string }> = [
  { value: 'y', label: 'Todas las palabras (y)' },
  { value: 'o', label: 'Cualquiera (o)' },
]

export default function GlosarioBuscador({ terminos }: { terminos: TerminoGlosario[] }) {
  const [consulta, setConsulta] = useState('')
  const [modo, setModo] = useState<ModoBusqueda>('y')
  const buscando = consulta.trim() !== ''
  const variasPalabras = consulta.trim().split(/\s+/).length > 1
  const resultados = buscando ? terminos.filter(t => coincide(t, consulta, modo)) : []

  return (
    <div>
      <input
        type="search"
        className="buscador"
        placeholder="Buscar un término…"
        aria-label="Buscar en el glosario"
        value={consulta}
        onChange={e => setConsulta(e.target.value)}
      />

      {variasPalabras && (
        <div className="filtro-modo" role="group" aria-label="Cómo combinar las palabras">
          {MODOS.map(opcion => (
            <button
              key={opcion.value}
              type="button"
              className={`filtro-btn${modo === opcion.value ? ' on' : ''}`}
              aria-pressed={modo === opcion.value}
              onClick={() => setModo(opcion.value)}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      )}

      {buscando ? (
        <>
          <p className="meta" aria-live="polite" style={{ marginTop: 16 }}>
            {resultados.length === 0
              ? 'Ningún término coincide.'
              : `${resultados.length} ${resultados.length === 1 ? 'término' : 'términos'}`}
          </p>
          <div className="ses-list">
            {resultados.map(termino => (
              <TerminoRow key={termino.slug} termino={termino} />
            ))}
          </div>
        </>
      ) : (
        ORDEN_CATEGORIAS.map(categoria => (
          <div key={categoria}>
            <h2 style={{ marginTop: 40 }}>{CATEGORIAS[categoria]}</h2>
            <div className="ses-list">
              {terminos
                .filter(t => t.categoria === categoria)
                .map(termino => (
                  <TerminoRow key={termino.slug} termino={termino} />
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
