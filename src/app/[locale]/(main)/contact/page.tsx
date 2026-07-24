import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ContactForm from '@/components/ContactForm'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { es: '/es/contact', en: '/en/contact' }
    },
    openGraph: {
      title: `${t('contactTitle')} — Sergio Monsalve`,
      description: t('contactDescription'),
      url: `/${locale}/contact`
    }
  }
}

export default async function ContactPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <p className="font-mono text-xs text-text-muted mb-3">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">
        {t('title')}
      </h1>
      <ContactForm />
    </div>
  )
}
