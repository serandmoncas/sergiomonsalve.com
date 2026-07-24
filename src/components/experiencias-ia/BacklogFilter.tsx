'use client'

import { useState } from 'react'
import type { BacklogItem, Prioridad } from '@/lib/experiencias-ia/data'

const OPCIONES: Array<{ value: Prioridad | 'todas'; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

export default function BacklogFilter({ items }: { items: BacklogItem[] }) {
  const [filtro, setFiltro] = useState<Prioridad | 'todas'>('todas')
  const visibles = filtro === 'todas' ? items : items.filter(item => item.prioridad === filtro)

  return (
    <div>
      <div className="filtro-prioridad">
        {OPCIONES.map(opcion => (
          <button
            key={opcion.value}
            type="button"
            className={`filtro-btn${filtro === opcion.value ? ' on' : ''}`}
            onClick={() => setFiltro(opcion.value)}
          >
            {opcion.label}
          </button>
        ))}
      </div>
      <div className="grid g2">
        {visibles.map(item => (
          <div className="card" key={item.titulo}>
            <span className={`prioridad ${item.prioridad}`}>{item.prioridad}</span>
            <h3>{item.titulo}</h3>
            <p className="ses-d">{item.proponente}</p>
            <p>{item.nota}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
