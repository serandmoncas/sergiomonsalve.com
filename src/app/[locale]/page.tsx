import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import AboutPageContent from '@/components/about/AboutPageContent'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: { absolute: t('heroTitle') },
    description: t('aboutDescription'),
    alternates: {
      canonical: `/${locale}`,
      languages: { es: '/es', en: '/en' }
    },
    openGraph: {
      title: t('heroTitle'),
      description: t('aboutDescription'),
      url: `/${locale}`
    }
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Sergio Monsalve',
  jobTitle: 'AI Software Engineer',
  url: 'https://sergiomonsalve.com',
  sameAs: [
    'https://github.com/serandmoncas',
    'https://www.instagram.com/samonsalvec/'
  ]
}

// Safe: jsonLd is a hardcoded compile-time constant, not user input
const jsonLdString = JSON.stringify(jsonLd)

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <AboutPageContent
        locale={locale}
        downloadCvLabel={t('downloadCv')}
        portfolioLabel={locale === 'es' ? 'Ver portfolio →' : 'View portfolio →'}
        eduTitle={t('educationTitle')}
      />
    </>
  )
}
