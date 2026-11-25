import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getReader } from '@/lib/manual/access'
import { getManual } from '@/lib/manual/manual'
import { mapaHref, grafoHref } from '@/lib/manual/paths'

function Aviso({ texto }: { texto: string }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      <p className="text-sm text-text-muted">{texto}</p>
    </div>
  )
}

// Guarda de lector: sin sesión válida no se toca el manual.
export default async function LectorLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('manual')

  const reader = await getReader()
  if (!reader) return <Aviso texto={t('sinAcceso')} />

  // Solo para decidir si hay manual; las páginas lo vuelven a pedir (cache()).
  const res = await getManual()
  if (!res.ok) {
    if (res.error.tipo === 'no-configurado') return <Aviso texto={t('noDisponible')} />
    // El detalle nunca se muestra al lector.
    console.error(`[manual] fallo en la guarda: ${res.error.detalle}`)
    return <Aviso texto={t('fallo')} />
  }

  return (
    <>
      <nav className="border-b border-border px-6 py-3 flex gap-6 font-mono text-xs">
        <Link href={mapaHref()} className="text-text-muted hover:text-accent">{t('nav.mapa')}</Link>
        <Link href={grafoHref()} className="text-text-muted hover:text-accent">{t('nav.grafo')}</Link>
      </nav>
      {children}
    </>
  )
}
