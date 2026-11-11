import { useTranslations } from 'next-intl'

const WHATSAPP_NUMBER = '573508025988'
const REPO_URL = 'https://github.com/serandmoncas/CarpinterIA'
// Apunta a main para que siempre baje la versión más reciente de la guía.
const GUIDE_URL = `${REPO_URL}/raw/main/guia/guia-del-curso.pdf`

type Session = { number: string; title: string; text: string }
type Tool = { title: string; text: string }

export default function CarpinteriaContent() {
  const t = useTranslations('carpinteria')
  const facts = t.raw('facts') as string[]
  const expressPoints = t.raw('express.points') as string[]
  const sessions = t.raw('course.sessions') as Session[]
  const tools = t.raw('tools.items') as Tool[]
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('cta.whatsappText'))}`

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">
      <header className="space-y-5">
        <p className="font-mono text-xs text-accent">{t('comment')}</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text text-balance">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-text-secondary leading-relaxed">{t('lede')}</p>
        <ul className="flex flex-wrap gap-2 pt-2">
          {facts.map(item => (
            <li key={item} className="font-mono text-xs border border-border text-text-secondary px-3 py-1.5 rounded-sm">
              {item}
            </li>
          ))}
        </ul>
      </header>

      <section className="space-y-8">
        <div className="space-y-2">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{t('express.label')}</p>
          <h2 className="text-2xl font-bold text-text">{t('express.title')}</h2>
          <p className="max-w-2xl text-sm text-text-secondary leading-relaxed">{t('express.desc')}</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {expressPoints.map(point => (
            <li key={point} className="text-sm text-text-secondary leading-relaxed pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-accent">
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{t('course.label')}</p>
          <h2 className="text-2xl font-bold text-text">{t('course.title')}</h2>
          <p className="max-w-2xl text-sm text-text-secondary leading-relaxed">{t('course.desc')}</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sessions.map(session => (
            <li key={session.number} className="bg-surface border border-border rounded-sm p-5 space-y-2">
              <span className="font-mono text-3xl font-bold text-accent" aria-hidden="true">{session.number}</span>
              <h3 className="text-sm font-semibold text-text">{session.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{session.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{t('tools.label')}</p>
          <h2 className="text-2xl font-bold text-text">{t('tools.title')}</h2>
          <p className="max-w-2xl text-sm text-text-secondary leading-relaxed">{t('tools.desc')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {tools.map(tool => (
            <article key={tool.title} className="border border-border rounded-sm p-6 space-y-3">
              <h3 className="text-sm font-bold text-text">{tool.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{tool.text}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={GUIDE_URL}
            className="inline-block bg-accent text-background text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            {t('tools.guide')}
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-xs border border-accent text-accent px-4 py-2.5 rounded-sm hover:bg-accent hover:text-background transition-colors"
          >
            {t('tools.repo')}
          </a>
        </div>
      </section>

      <section className="border-t border-border pt-12 space-y-6">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{t('cta.label')}</p>
        <h2 className="text-2xl font-bold text-text max-w-2xl text-balance">{t('cta.title')}</h2>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-accent text-background text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
        >
          {t('cta.whatsapp')}
        </a>
      </section>
    </div>
  )
}
