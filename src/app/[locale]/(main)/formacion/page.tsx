import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import FormacionContent from '@/components/FormacionContent'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('formacionTitle'),
    description: t('formacionDescription'),
    alternates: {
      canonical: `/${locale}/formacion`,
      languages: { es: '/es/formacion', en: '/en/formacion' }
    },
    openGraph: {
      title: `${t('formacionTitle')} — Sergio Monsalve`,
      description: t('formacionDescription'),
      url: `/${locale}/formacion`
    }
  }
}

export default function FormacionPage() {
  return <FormacionContent />
}
