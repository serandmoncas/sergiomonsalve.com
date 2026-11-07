import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getEspecies, getFechaConsulta } from '@/lib/aves/catalogo'
import AvesExplorador from '@/components/aves/AvesExplorador'
import AtribucionDatos from '@/components/aves/AtribucionDatos'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('avesTitle'),
    description: t('avesDescription'),
    alternates: {
      canonical: `/${locale}/aves`,
      languages: { es: '/es/aves', en: '/en/aves' }
    },
    openGraph: {
      title: `${t('avesTitle')} — Sergio Monsalve`,
      description: t('avesDescription'),
      url: `/${locale}/aves`
    }
  }
}

export default async function AvesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'aves' })

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text mb-3">{t('titulo')}</h1>
      <p className="text-sm text-text-secondary leading-relaxed max-w-2xl mb-10">{t('subtitulo')}</p>
      <AvesExplorador especies={getEspecies()} />
      <AtribucionDatos fecha={getFechaConsulta()} />
    </div>
  )
}
