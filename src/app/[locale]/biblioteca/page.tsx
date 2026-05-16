import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllBooks, applyBookOverrides } from '@/lib/library'
import type { BookOverride } from '@/lib/library'
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

  const admin = createAdminClient()
  const { data: overrides } = await admin
    .from('library_books')
    .select('asin, visible, status')
  const books = applyBookOverrides(getAllBooks(locale), (overrides ?? []) as BookOverride[])

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-accent mb-2">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">{t('title')}</h1>
      <BookList books={books} locale={locale} />
    </div>
  )
}
