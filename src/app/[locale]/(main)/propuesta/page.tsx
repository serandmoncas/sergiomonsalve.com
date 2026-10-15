import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ProposalContent from '@/components/ProposalContent'
import { cleanCompany } from '@/lib/propuesta/company'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ empresa?: string | string[] }>
}

// Página privada: se comparte por enlace, no se indexa ni aparece en el sitemap.
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params
  const company = cleanCompany((await searchParams).empresa)
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: company ? `${t('propuestaTitle')} · ${company}` : t('propuestaTitle'),
    robots: { index: false, follow: false }
  }
}

export default async function ProposalPage({ searchParams }: Props) {
  const company = cleanCompany((await searchParams).empresa)
  return <ProposalContent company={company} />
}
