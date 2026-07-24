import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getPost, getPostSlugs } from '@/lib/posts'
import MDXContent from '@/components/MDXContent'
import CommentForm from '@/components/CommentForm'
import CommentList from '@/components/CommentList'

export function generateStaticParams({ params: { locale } }: { params: { locale: string } }) {
  return getPostSlugs(locale).map(slug => ({ slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getPost(slug, locale)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/${locale}/blog/${slug}` }
  }
}

export default async function PostPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const post = getPost(slug, locale)
  if (!post) notFound()

  const t = await getTranslations({ locale, namespace: 'blog' })

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link
        href="/blog"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-10 block"
      >
        ← {t('title')}
      </Link>
      <p className="font-mono text-xs text-text-muted mb-2">
        {post.date} · {post.readingTime}
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-4">{post.title}</h1>
      <div className="flex flex-wrap gap-1.5 mb-10">
        {post.tags.map(tag => (
          <span
            key={tag}
            className="font-mono text-xs text-accent bg-surface border border-border-active px-2 py-0.5 rounded-sm"
          >
            {tag}
          </span>
        ))}
      </div>
      <MDXContent source={post.content} />
      <CommentList postSlug={post.slug} locale={locale} />
      <CommentForm postSlug={post.slug} />
    </div>
  )
}
