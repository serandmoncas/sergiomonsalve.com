import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import SkillTag from './SkillTag'

export default function Hero() {
  const t = useTranslations('hero')
  const skills: string[] = t.raw('skills')

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs text-text-muted mb-4">{t('comment')}</p>

      <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none text-text mb-6">
        Sergio<br />Monsalve
      </h1>

      <p className="max-w-xl text-sm text-text-secondary leading-relaxed mb-8">
        {t('tagline')}
      </p>

      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/contact"
          className="bg-accent text-background text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
        >
          {t('cta.contact')}
        </Link>
        <a
          href="#cv"
          className="border border-border text-text-secondary text-xs px-5 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors"
        >
          {t('cta.cv')}
        </a>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {skills.map(skill => (
          <SkillTag key={skill} label={skill} />
        ))}
      </div>
    </section>
  )
}
