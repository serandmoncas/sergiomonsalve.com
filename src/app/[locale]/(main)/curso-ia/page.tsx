import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import CuposBadge from '@/components/curso-ia/CuposBadge'
import InscripcionForm from '@/components/curso-ia/InscripcionForm'
import { COHORTE, isClosed } from '@/lib/curso-ia/cohorte'
import { countConfirmed } from '@/lib/curso-ia/registrations'

// El contador de cupos se refresca cada minuto; el cupo real lo asigna la base de datos.
export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('cursoIaTitle'),
    description: t('cursoIaDescription'),
    alternates: { canonical: '/es/curso-ia' },
    openGraph: { title: `${t('cursoIaTitle')} — Sergio Monsalve`, description: t('cursoIaDescription'), url: '/es/curso-ia' }
  }
}

type Session = { day: string; title: string; outcome: string }
type Faq = { q: string; a: string }

export default async function CursoIaPage() {
  const t = await getTranslations({ locale: 'es', namespace: 'cursoIa' })
  const confirmed = await countConfirmed()
  const closed = isClosed(new Date())
  const full = confirmed !== null && confirmed >= COHORTE.capacity

  const chips = t.raw('chips') as string[]
  const forWho = t.raw('forWho.items') as string[]
  const faq = t.raw('faq.items') as Faq[]
  const sessions = COHORTE.sessions.map(s => t.raw(`program.sessions.${s.topicKey}`) as Session)

  const label = 'font-mono text-xs text-text-muted uppercase tracking-widest'
  const whatsapp = (
    <a
      href={COHORTE.whatsapp.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block font-mono text-xs border border-accent text-accent px-4 py-2.5 rounded-sm hover:bg-accent hover:text-background transition-colors"
    >
      {t('whatsappCta')} · {COHORTE.whatsapp.display}
    </a>
  )

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 sm:py-16 space-y-16">
      <header className="space-y-5">
        <p className="font-mono text-xs text-accent">{t('comment')}</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text text-balance">{t('title')}</h1>
        <p className="text-base text-text-secondary leading-relaxed">{t('lede')}</p>
        <ul className="flex flex-wrap gap-2">
          {chips.map(chip => (
            <li key={chip} className="font-mono text-xs border border-border text-text-secondary px-3 py-1.5 rounded-sm">{chip}</li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a href="#inscripcion" className="font-mono text-sm bg-accent text-background font-bold px-6 py-3.5 rounded-sm hover:opacity-90 transition-opacity">
            {t('ctaTop')}
          </a>
          <CuposBadge confirmed={confirmed} capacity={COHORTE.capacity} closed={closed} />
        </div>
      </header>

      {COHORTE.youtubeId && (
        <section aria-label={t('videoTitle')}>
          <div className="relative w-full max-w-sm mx-auto aspect-[9/16] overflow-hidden rounded-sm border border-border">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${COHORTE.youtubeId}`}
              title={t('videoTitle')}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="space-y-2">
          <p className={label}>{t('program.label')}</p>
          <h2 className="text-2xl font-bold text-text">{t('program.title')}</h2>
        </div>
        <ol className="space-y-4">
          {sessions.map((s, i) => (
            <li key={s.day} className="bg-surface border border-border rounded-sm p-5 space-y-2">
              <p className="font-mono text-xs text-accent">{`0${i + 1}`} · {s.day}</p>
              <h3 className="text-base font-semibold text-text">{s.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                <span className="text-text-muted">{t('program.youLeave')}: </span>
                {s.outcome}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <p className={label}>{t('forWho.label')}</p>
        <h2 className="text-2xl font-bold text-text">{t('forWho.title')}</h2>
        <ul className="space-y-2 list-disc pl-5 text-sm text-text-secondary leading-relaxed">
          {forWho.map(item => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="flex flex-col sm:flex-row gap-6 items-start">
        <Image src="/about/sergio-profile.jpg" alt={t('teacher.title')} width={120} height={120} className="rounded-sm border border-border object-cover" />
        <div className="space-y-2">
          <p className={label}>{t('teacher.label')}</p>
          <h2 className="text-xl font-bold text-text">{t('teacher.title')}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{t('teacher.bio')}</p>
        </div>
      </section>

      <section id="inscripcion" className="space-y-6 scroll-mt-20">
        <div className="space-y-2">
          <p className={label}>{t('signup.label')}</p>
          <h2 className="text-2xl font-bold text-text">{t('signup.title')}</h2>
          <p className="text-sm text-text-secondary">{t('signup.desc')}</p>
          <CuposBadge confirmed={confirmed} capacity={COHORTE.capacity} closed={closed} />
        </div>
        <InscripcionForm full={full} closed={closed} />
      </section>

      <section className="space-y-4">
        <p className={label}>{t('faq.label')}</p>
        <dl className="space-y-4">
          {faq.map(item => (
            <div key={item.q} className="border-b border-border pb-4">
              <dt className="text-sm font-semibold text-text">{item.q}</dt>
              <dd className="mt-1 text-sm text-text-secondary leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
        {whatsapp}
      </section>
    </div>
  )
}
