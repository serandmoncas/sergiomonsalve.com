import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import CarpinteriaContent from '@/components/CarpinteriaContent'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('carpinteriaTitle'),
    description: t('carpinteriaDescription'),
    alternates: {
      canonical: `/${locale}/carpinteria`,
      languages: { es: '/es/carpinteria', en: '/en/carpinteria' }
    },
    openGraph: {
      title: `${t('carpinteriaTitle')} — Sergio Monsalve`,
      description: t('carpinteriaDescription'),
      url: `/${locale}/carpinteria`
    }
  }
}

export default function CarpinteriaPage() {
  return <CarpinteriaContent />
}
