import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getAllUnifiedBooks } from '@/lib/unified-library'
import BookList from '@/components/BookList'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('bibliotecaTitle'),
    description: t('bibliotecaDescription'),
    alternates: { canonical: `/${locale}/biblioteca` },
  }
}

export default async function BibliotecaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'biblioteca' })

  const [books, supabase] = await Promise.all([
    getAllUnifiedBooks(locale),
    createClient(),
  ])
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-accent mb-2">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">{t('title')}</h1>
      <BookList books={books} locale={locale} isOwner={!!user} />
    </div>
  )
}
