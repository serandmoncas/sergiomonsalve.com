import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAllPosts } from '@/lib/posts'
import BlogList from '@/components/BlogList'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('blogTitle'),
    description: t('blogDescription'),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { es: '/es/blog', en: '/en/blog' },
      types: { 'application/rss+xml': `/${locale}/blog/rss.xml` }
    }
  }
}

export default async function BlogPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const posts = getAllPosts(locale)

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-text-muted mb-3">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">{t('title')}</h1>
      <BlogList posts={posts} locale={locale} />
    </div>
  )
}
