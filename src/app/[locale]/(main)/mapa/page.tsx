import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import MapaTool from '@/components/mapa/MapaTool'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('mapaTitle'),
    description: t('mapaDescription'),
    alternates: { canonical: `/${locale}/mapa`, languages: { es: '/es/mapa', en: '/en/mapa' } },
    openGraph: { title: `${t('mapaTitle')} — Sergio Monsalve`, description: t('mapaDescription'), url: `/${locale}/mapa` }
  }
}

export default async function MapaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <MapaTool locale={locale === 'en' ? 'en' : 'es'} />
}
