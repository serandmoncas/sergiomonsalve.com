import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const WHATSAPP_NUMBER = '573508025988'

type Step = { letter: string; title: string; text: string }
type AgendaItem = { time: string; title: string; text: string }
type Week = { label: string; title: string; text: string }
type PriceRow = { name: string; note: string; cop: string; usd: string }

const sectionLabel = 'font-mono text-xs text-text-muted uppercase tracking-widest'
const bullet = "text-sm text-text-secondary leading-relaxed pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-accent"

export default function ProposalContent({ company }: { company: string | null }) {
  const t = useTranslations('propuesta')
  const steps = t.raw('method.steps') as Step[]
  const agenda = t.raw('pilot.agenda') as AgendaItem[]
  const pilotDeliverables = t.raw('pilot.deliverables') as string[]
  const weeks = t.raw('sprint.weeks') as Week[]
  const sprintDeliverables = t.raw('sprint.deliverables') as string[]
  const prices = t.raw('pricing.rows') as PriceRow[]
  const exchange = t.raw('pricing.exchange') as string[]
  const about = t.raw('about.items') as string[]

  const title = company ? t('titleFor', { company }) : t('titleGeneric')
  const whatsappText = company ? t('next.whatsappTextFor', { company }) : t('next.whatsappTextGeneric')
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">
      <header className="space-y-5 border-b border-border pb-12">
        <p className="font-mono text-xs text-accent">{t('comment')}</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text text-balance">{title}</h1>
        <p className="max-w-2xl text-base text-text-secondary leading-relaxed">{t('subtitle')}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-text-muted">
          <span>{t('by')}</span>
          <span>{t('validity')}</span>
        </div>
      </header>

      <section className="space-y-5">
        <p className={sectionLabel}>{t('problem.label')}</p>
        <h2 className="text-2xl font-bold text-text text-balance">{t('problem.title')}</h2>
        <p className="max-w-2xl text-sm text-text-secondary leading-relaxed">{t('problem.text')}</p>
        <blockquote className="border-l-2 border-accent pl-5 space-y-1 max-w-2xl">
          <p className="text-lg font-semibold text-text">{t('problem.stat')}</p>
          <cite className="font-mono text-xs text-text-muted not-italic">{t('problem.statSource')}</cite>
        </blockquote>
        <p className="max-w-2xl text-sm text-text">{t('problem.close')}</p>
      </section>

      <section className="space-y-6">
        <p className={sectionLabel}>{t('method.label')}</p>
        <h2 className="text-2xl font-bold text-text">{t('method.title')}</h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, i) => (
            <li key={i} className="bg-surface border border-border rounded-sm p-5 space-y-2">
              <span aria-hidden="true" className="font-mono text-3xl font-bold text-accent">{step.letter}</span>
              <h3 className="text-sm font-semibold text-text">{step.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-8">
        <div className="space-y-2">
          <p className={sectionLabel}>{t('options.label')}</p>
          <h2 className="text-2xl font-bold text-text">{t('options.title')}</h2>
        </div>

        <article className="border border-border rounded-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <p className="font-mono text-xs text-accent">{t('pilot.tag')}</p>
            <h3 className="text-xl font-bold text-text">{t('pilot.title')}</h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">{t('pilot.text')}</p>
          </div>
          <div className="space-y-3">
            <p className={sectionLabel}>{t('pilot.agendaLabel')}</p>
            <ol className="divide-y divide-border border-y border-border">
              {agenda.map(item => (
                <li key={item.time} className="grid grid-cols-[4.5rem_1fr] gap-4 py-3">
                  <span className="font-mono text-xs text-text-muted tabular-nums pt-0.5">{item.time}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text">{item.title}</p>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-3">
            <p className={sectionLabel}>{t('pilot.deliverablesLabel')}</p>
            <ul className="space-y-2">{pilotDeliverables.map(d => <li key={d} className={bullet}>{d}</li>)}</ul>
          </div>
        </article>

        <article className="border-2 border-accent rounded-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <p className="font-mono text-xs text-accent">{t('sprint.tag')}</p>
            <h3 className="text-xl font-bold text-text">{t('sprint.title')}</h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">{t('sprint.text')}</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {weeks.map(week => (
              <li key={week.label} data-testid="sprint-week" className="bg-surface border border-border rounded-sm p-5 space-y-1.5">
                <p className="font-mono text-xs text-accent">{week.label}</p>
                <p className="text-sm font-semibold text-text">{week.title}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{week.text}</p>
              </li>
            ))}
          </ol>
          <div className="space-y-3">
            <p className={sectionLabel}>{t('sprint.deliverablesLabel')}</p>
            <ul className="space-y-2">{sprintDeliverables.map(d => <li key={d} className={bullet}>{d}</li>)}</ul>
          </div>
        </article>
      </section>

      <section className="space-y-6">
        <p className={sectionLabel}>{t('pricing.label')}</p>
        <h2 className="text-2xl font-bold text-text">{t('pricing.title')}</h2>
        <div className="overflow-x-auto border border-border rounded-sm">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="font-mono text-xs font-normal text-text-muted uppercase tracking-wider px-4 py-3">{t('pricing.colOption')}</th>
                <th className="font-mono text-xs font-normal text-text-muted uppercase tracking-wider px-4 py-3">{t('pricing.colCop')}</th>
                <th className="font-mono text-xs font-normal text-text-muted uppercase tracking-wider px-4 py-3">{t('pricing.colUsd')}</th>
              </tr>
            </thead>
            <tbody>
              {prices.map(row => (
                <tr key={row.name} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">{row.name}</p>
                    <p className="text-xs text-text-muted">{row.note}</p>
                  </td>
                  <td className="px-4 py-4 font-mono tabular-nums text-text">{row.cop}</td>
                  <td className="px-4 py-4 font-mono tabular-nums text-text">{row.usd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted max-w-2xl">{t('pricing.footnote')}</p>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-text">{t('pricing.exchangeLabel')}</p>
          <ul className="space-y-2">{exchange.map(e => <li key={e} className={bullet}>{e}</li>)}</ul>
        </div>
      </section>

      <section className="space-y-5">
        <p className={sectionLabel}>{t('about.label')}</p>
        <h2 className="text-2xl font-bold text-text">{t('about.title')}</h2>
        <ul className="space-y-2">{about.map(a => <li key={a} className={bullet}>{a}</li>)}</ul>
      </section>

      <section className="border-t border-border pt-12 space-y-6">
        <p className={sectionLabel}>{t('next.label')}</p>
        <h2 className="text-2xl font-bold text-text max-w-2xl text-balance">{t('next.title')}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="bg-accent text-background text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity">
            {t('next.whatsapp')}
          </a>
          <Link href="/contact?tipo=training" className="border border-border text-text-secondary text-xs px-5 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors">
            {t('next.contact')}
          </Link>
        </div>
      </section>
    </div>
  )
}
