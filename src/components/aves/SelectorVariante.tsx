'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Especie, Variante } from '@/lib/aves/tipos'
import IlustracionAve from './IlustracionAve'

// En la ficha: si hay más de una variante aprobada (macho, hembra...), botones para cambiar
export default function SelectorVariante({ especie }: { especie: Especie }) {
  const t = useTranslations('aves')
  const variantes = especie.ilustraciones.map(i => i.variante)
  const [actual, setActual] = useState<Variante | undefined>(variantes[0])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <IlustracionAve especie={especie} tamano={1024} variante={actual} />
      </div>
      {variantes.length > 1 && (
        <div className="flex gap-2 p-2 border-t border-border">
          {variantes.map(v => (
            <button
              key={v}
              type="button"
              aria-pressed={v === actual}
              onClick={() => setActual(v)}
              className={`font-mono text-xs px-3 py-1.5 rounded-sm border ${v === actual ? 'border-accent text-accent' : 'border-border text-text-secondary'}`}
            >
              {t(`variante.${v}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
