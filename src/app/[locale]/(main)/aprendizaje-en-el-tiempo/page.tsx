import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LineaAprendizaje from '@/components/LineaAprendizaje'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('lineaAprendizajeTitle'),
    description: t('lineaAprendizajeDescription'),
    alternates: {
      canonical: `/${locale}/aprendizaje-en-el-tiempo`,
      languages: { es: '/es/aprendizaje-en-el-tiempo', en: '/en/aprendizaje-en-el-tiempo' }
    },
    openGraph: {
      title: `${t('lineaAprendizajeTitle')} — Sergio Monsalve`,
      description: t('lineaAprendizajeDescription'),
      url: `/${locale}/aprendizaje-en-el-tiempo`
    }
  }
}

export default function LineaAprendizajePage() {
  return <LineaAprendizaje />
}
