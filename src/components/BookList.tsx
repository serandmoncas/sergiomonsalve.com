'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import BookCard from './BookCard'
import type { BookStatus } from '@/lib/library'
import type { UnifiedBook } from '@/lib/unified-library'

const ALL_STATUSES: BookStatus[] = ['listening', 'completed', 'queued', 'abandoned']

export default function BookList({ books, locale }: { books: UnifiedBook[]; locale: string }) {
  const t = useTranslations('biblioteca')
  const [activeStatus, setActiveStatus] = useState<BookStatus | null>(null)
  const [search, setSearch] = useState('')

  const statusLabel: Record<BookStatus, string> = {
    listening: t('statusListening'),
    completed: t('statusCompleted'),
    queued: t('statusQueued'),
    abandoned: t('statusAbandoned'),
  }

  const query = search.toLowerCase()
  const filtered = books.filter(b => {
    const matchesStatus = !activeStatus || b.status === activeStatus
    const matchesSearch = !query ||
      b.title.toLowerCase().includes(query) ||
      b.authors.some(a => a.toLowerCase().includes(query))
    return matchesStatus && matchesSearch
  })

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full font-mono text-xs bg-surface border border-border rounded-sm px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-accent mb-6"
      />
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveStatus(null)}
          className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
            !activeStatus
              ? 'bg-accent text-background border-accent font-bold'
              : 'border-border text-text-secondary hover:border-accent hover:text-accent'
          }`}
        >
          {t('allStatuses')}
        </button>
        {ALL_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(activeStatus === status ? null : status)}
            className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
              activeStatus === status
                ? 'bg-accent text-background border-accent font-bold'
                : 'border-border text-text-secondary hover:border-accent hover:text-accent'
            }`}
          >
            {statusLabel[status]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">// {t('empty')}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(book => (
            <BookCard
              key={book.id}
              book={book}
              locale={locale}
              statusLabel={statusLabel[book.status]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
