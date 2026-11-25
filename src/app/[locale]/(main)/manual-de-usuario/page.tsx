import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireReader } from '@/lib/manual/access'
import { getManual } from '@/lib/manual/manual'
import { MANUAL_BASE, MANUAL_ES_BASE } from '@/lib/manual/paths'
import { ManualMarkdown } from '@/components/manual/ManualMarkdown'

// Portada pública: el texto "sobre" es público por diseño. Con lector, va al mapa.
export default async function Portada() {
  if (await requireReader()) redirect(`${MANUAL_ES_BASE}/mapa`)

  const t = await getTranslations('manual')
  const res = await getManual()
  const sobre = res.ok ? res.manual.sobre : null

  return (
    <div className="max-w-[68ch] mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-text mb-8">{t('portada.titulo')}</h1>
      {sobre ? <ManualMarkdown md={sobre} resolve={() => null} /> : <p className="text-text-secondary">{t('sobreFallback')}</p>}
      <div className="flex gap-4 mt-10 font-mono text-xs">
        <Link href={`${MANUAL_BASE}/entrar`} className="bg-accent text-background px-5 py-2 rounded-sm hover:opacity-90">{t('portada.entrar')}</Link>
        <Link href="/contact" className="border border-border px-5 py-2 rounded-sm text-text-muted hover:text-accent">{t('portada.pedirAcceso')}</Link>
      </div>
    </div>
  )
}
