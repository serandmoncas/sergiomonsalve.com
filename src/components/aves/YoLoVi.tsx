'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

const CLAVE = 'aves:vistas'

// Si localStorage falla (navegación privada, almacenamiento bloqueado) la lista vive en memoria
let memoria: string | null = null
const oyentes = new Set<() => void>()

function leer(): string {
  if (memoria !== null) return memoria
  try {
    return localStorage.getItem(CLAVE) ?? '[]'
  } catch {
    return '[]'
  }
}

function escribir(valor: string) {
  try {
    localStorage.setItem(CLAVE, valor)
    memoria = null
  } catch {
    memoria = valor
  }
  oyentes.forEach(avisar => avisar())
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar)
  window.addEventListener('storage', avisar)
  return () => {
    oyentes.delete(avisar)
    window.removeEventListener('storage', avisar)
  }
}

function parsear(valor: string): number[] {
  try {
    const lista = JSON.parse(valor)
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

// Lista de vida del visitante, solo en su navegador
export default function YoLoVi({ speciesKey }: { speciesKey: number }) {
  const t = useTranslations('aves')
  const vistas = parsear(useSyncExternalStore(suscribir, leer, () => '[]'))
  const visto = vistas.includes(speciesKey)

  const alternar = () => {
    const resto = vistas.filter(k => k !== speciesKey)
    escribir(JSON.stringify(visto ? resto : [...resto, speciesKey]))
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
