import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getManualForReader } from '@/lib/manual/lector'
import { mapaHref, grafoHref } from '@/lib/manual/paths'

function Aviso({ texto }: { texto: string }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      <p className="text-sm text-text-muted">{texto}</p>
    </div>
  )
}

// Guarda de lector. Las páginas también deben usar getManualForReader.
export default async function LectorLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('manual')

  const res = await getManualForReader()
  if (!res.ok) {
    if (res.motivo === 'sin-acceso') return <Aviso texto={t('sinAcceso')} />
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
