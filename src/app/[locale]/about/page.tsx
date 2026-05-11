import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import AboutPageContent from '@/components/about/AboutPageContent'
import AboutSkinWrapper from '@/components/about/AboutSkinWrapper'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    alternates: {
      canonical: `/${locale}/about`,
      languages: { es: '/es/about', en: '/en/about' }
    },
    openGraph: {
      title: `${t('aboutTitle')} — Sergio Monsalve`,
      description: t('aboutDescription'),
      url: `/${locale}/about`
    }
  }
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <AboutSkinWrapper>
      <AboutPageContent
        locale={locale}
        downloadCvLabel={t('downloadCv')}
        portfolioLabel={locale === 'es' ? 'Ver portfolio →' : 'View portfolio →'}
        eduTitle={t('educationTitle')}
      />
    </AboutSkinWrapper>
  )
}
