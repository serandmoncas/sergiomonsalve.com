import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('privacyTitle'), alternates: { canonical: `/${locale}/privacidad` } }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })
  const sections = t.raw('sections') as { title: string; text: string }[]
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs text-text-muted">{t('comment')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-text">{t('title')}</h1>
        <p className="font-mono text-xs text-text-muted">{t('updated')}</p>
      </header>
      {sections.map(s => (
        <section key={s.title} className="space-y-2">
          <h2 className="text-base font-bold text-text">{s.title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{s.text}</p>
        </section>
      ))}
    </div>
  )
}
