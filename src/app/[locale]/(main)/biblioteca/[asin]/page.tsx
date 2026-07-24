import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import ReactMarkdown from 'react-markdown'
import { getBookAsins } from '@/lib/library'
import { getUnifiedBook } from '@/lib/unified-library'
import StarRating from '@/components/StarRating'

export function generateStaticParams() {
  return getBookAsins().map(asin => ({ asin }))
}

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; asin: string }>
}): Promise<Metadata> {
  const { locale, asin } = await params
  const book = await getUnifiedBook(asin, locale)
  if (!book) return {}
  return {
    title: book.title,
    description: book.description.slice(0, 160),
    alternates: { canonical: `/${locale}/biblioteca/${asin}` },
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string; asin: string }>
}) {
  const { locale, asin } = await params
  const book = await getUnifiedBook(asin, locale)
  if (!book) notFound()

  const t = await getTranslations({ locale, namespace: 'biblioteca' })
  const hours = Math.floor(book.runtime_length_min / 60)
  const minutes = book.runtime_length_min % 60

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link
        href="/biblioteca"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-10 block"
      >
        ← {t('title')}
      </Link>

      <div className="flex gap-6 mb-8">
        {book.cover_url && (
          <div className="shrink-0 w-28 h-36 relative rounded-sm overflow-hidden bg-surface">
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-text mb-2">{book.title}</h1>
          <p className="font-mono text-xs text-text-secondary mb-1">{book.authors.join(', ')}</p>
          {book.narrators.length > 0 && (
            <p className="font-mono text-xs text-text-muted mb-3">
              {t('narrators')}: {book.narrators.join(', ')}
            </p>
          )}
          {book.rating !== null && (
            <div className="mb-3">
              <StarRating rating={book.rating} />
            </div>
          )}
          {book.runtime_length_min > 0 && (
            <p className="font-mono text-xs text-text-muted">
              {t('duration')}: {hours}h {minutes}m
            </p>
          )}
        </div>
      </div>

      {book.description && (
        <p className="text-xs text-text-secondary leading-relaxed mb-8">{book.description}</p>
      )}

      {book.highlights.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-xs text-accent mb-4">// {t('highlights')}</p>
          <div className="space-y-4">
            {book.highlights.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-accent pl-4 text-sm text-text-secondary italic"
              >
                {quote}
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {book.review_md && (
        <div className="mdx-prose mb-8">
          <ReactMarkdown>{book.review_md}</ReactMarkdown>
        </div>
      )}

      {book.source === 'audible' && (
        <a
          href={`https://www.audible.com/pd/${book.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-accent hover:underline mt-8 block"
        >
          {t('listenOnAudible')}
        </a>
      )}
    </div>
  )
}
