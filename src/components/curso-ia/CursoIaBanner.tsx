import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { isClosed } from '@/lib/curso-ia/cohorte'

// Banner en /formacion mientras las inscripciones del curso en vivo están abiertas.
export default function CursoIaBanner({ now }: { now: Date }) {
  const t = useTranslations('cursoIa')
  if (isClosed(now)) return null
  return (
    <aside className="border border-accent rounded-sm p-6 space-y-3">
      <p className="font-mono text-xs text-accent">{t('formacionBanner.label')}</p>
      <h2 className="text-xl font-bold text-text">{t('formacionBanner.title')}</h2>
      <p className="text-sm text-text-secondary">{t('formacionBanner.desc')}</p>
      <Link href="/curso-ia" className="inline-block font-mono text-xs bg-accent text-background font-bold px-4 py-2.5 rounded-sm hover:opacity-90 transition-opacity">
        {t('formacionBanner.cta')}
      </Link>
    </aside>
  )
}
