import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const WHATSAPP_NUMBER = '573508025988'

type Step = { letter: string; title: string; text: string }
type Offer = { audience: string; title: string; text: string; bullets: string[] }

export default function FormacionContent() {
  const t = useTranslations('formacion')
  const steps = t.raw('method.steps') as Step[]
  const credentials = t.raw('credentials.items') as string[]
  const offers = t.raw('offers.items') as Offer[]
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
          {credentials.map(item => (
            <li key={item} className="font-mono text-xs border border-border text-text-secondary px-3 py-1.5 rounded-sm">
              {item}
            </li>
          ))}
        </ul>
      </header>

      <section className="space-y-8">
        <div className="space-y-2">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{t('method.label')}</p>
          <h2 className="text-2xl font-bold text-text">{t('method.title')}</h2>
          <p className="max-w-2xl text-sm text-text-secondary leading-relaxed">{t('method.desc')}</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={i} className="bg-surface border border-border rounded-sm p-5 space-y-2">
              <span className="font-mono text-3xl font-bold text-accent" aria-hidden="true">{step.letter}</span>
              <h3 className="text-sm font-semibold text-text">{step.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{t('offers.label')}</p>
          <h2 className="text-2xl font-bold text-text">{t('offers.title')}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {offers.map(offer => (
            <article key={offer.title} className="border border-border rounded-sm p-6 space-y-4">
              <p className="font-mono text-xs text-accent">{offer.audience}</p>
              <h3 className="text-lg font-bold text-text">{offer.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{offer.text}</p>
              <ul className="space-y-2">
                {offer.bullets.map(bullet => (
                  <li key={bullet} className="text-xs text-text-secondary leading-relaxed pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-accent">
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border pt-12 space-y-6">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{t('cta.label')}</p>
        <h2 className="text-2xl font-bold text-text max-w-2xl text-balance">{t('cta.title')}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="bg-accent text-background text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            {t('cta.contact')}
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border text-text-secondary text-xs px-5 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            {t('cta.whatsapp')}
          </a>
        </div>
      </section>
    </div>
  )
}
