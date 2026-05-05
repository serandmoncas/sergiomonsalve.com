import { useTranslations } from 'next-intl'

export default function AboutBio() {
  const t = useTranslations('about')
  const skillGroups = t.raw('skillGroups') as string[]

  return (
    <div className="mb-16">
      <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-2xl">
        {t('bio')}
      </p>

      <p className="font-mono text-xs text-text-muted mb-4">{t('skillsTitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 max-w-lg">
        {skillGroups.map(group => (
          <p key={group} className="text-sm text-text-secondary">
            <span className="text-accent mr-2">▸</span>
            {group}
          </p>
        ))}
      </div>

      <p className="font-mono text-xs text-text-muted mb-3">{t('personalLabel')}</p>
      <div className="text-sm text-text-secondary space-y-1 mb-8">
        <p>
          <span aria-hidden="true">🍄</span>{' '}
          <a
            href="https://songosorhongo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {t('songosorhongoLabel')}
          </a>
        </p>
        <p>{t('location')}</p>
      </div>

      <a
        href="#"
        className="inline-block bg-accent text-background font-mono text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
      >
        {t('downloadCv')}
      </a>
    </div>
  )
}
