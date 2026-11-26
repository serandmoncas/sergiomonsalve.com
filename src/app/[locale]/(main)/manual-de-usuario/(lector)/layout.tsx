import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getManualForReader } from '@/lib/manual/lector'
import { avisoManual } from '@/components/manual/EstadoManual'
import { OcultarSergio } from '@/components/manual/OcultarSergio'
import { mapaHref, grafoHref } from '@/lib/manual/paths'

// Guarda de lector. Las páginas también deben usar getManualForReader.
export default async function LectorLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('manual')

  const res = await getManualForReader()
  if (!res.ok) return avisoManual(res)

  return (
    <>
      <nav className="border-b border-border px-6 py-3 flex gap-6 font-mono text-xs">
        <Link href={mapaHref()} className="text-text-muted hover:text-accent">{t('nav.mapa')}</Link>
        <Link href={grafoHref()} className="text-text-muted hover:text-accent">{t('nav.grafo')}</Link>
        <OcultarSergio />
      </nav>
      {children}
    </>
  )
}
