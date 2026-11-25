'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const SEGUIMIENTO = /^(utm_|fbclid$|gclid$|mc_|igshid$)/

export function CopiarEnlace() {
  const t = useTranslations('manual')
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    const url = new URL(window.location.href)
    for (const k of [...url.searchParams.keys()]) if (SEGUIMIENTO.test(k)) url.searchParams.delete(k)
    url.hash = ''
    try {
      await navigator.clipboard.writeText(url.toString())
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <button type="button" onClick={copiar} className="font-mono text-xs text-text-muted hover:text-accent">
      {copiado ? t('nota.copiado') : t('nota.copiarEnlace')}
    </button>
  )
}
