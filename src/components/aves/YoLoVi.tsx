'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const CLAVE = 'aves:vistas'

function leerVistas(): number[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
  } catch {
    return []
  }
}

// Lista de vida del visitante, solo en su navegador. Si localStorage falla, funciona en memoria.
export default function YoLoVi({ speciesKey }: { speciesKey: number }) {
  const t = useTranslations('aves')
  const [visto, setVisto] = useState(false)

  useEffect(() => {
    setVisto(leerVistas().includes(speciesKey))
  }, [speciesKey])

  const alternar = () => {
    const nuevo = !visto
    setVisto(nuevo)
    try {
      const vistas = leerVistas().filter(k => k !== speciesKey)
      localStorage.setItem(CLAVE, JSON.stringify(nuevo ? [...vistas, speciesKey] : vistas))
    } catch {
      // navegación privada o almacenamiento bloqueado: queda solo en memoria
    }
  }

  return (
    <button
      type="button"
      aria-pressed={visto}
      onClick={alternar}
      className={`font-mono text-xs px-4 py-2.5 rounded-sm border transition-colors ${
        visto ? 'border-accent bg-accent text-background' : 'border-border text-text-secondary hover:border-accent hover:text-accent'
      }`}
    >
      {visto ? t('yoLoViMarcado') : t('yoLoVi')}
    </button>
  )
}
