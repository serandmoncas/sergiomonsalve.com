'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import type { BookStatus } from '@/lib/library'

type AdminBook = {
  id: string
  source: 'audible' | 'manual'
  source_type?: string
  title: string
  authors: string[]
  cover_url: string
  runtime_length_min: number
  visible: boolean
  status: BookStatus
}

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'listening', label: 'leyendo' },
  { value: 'completed', label: 'completado' },
  { value: 'queued', label: 'en lista' },
  { value: 'abandoned', label: 'abandonado' },
]

const SOURCE_TYPE_LABEL: Record<string, string> = {
  physical: 'físico',
  ebook: 'ebook',
  other: 'otro',
}

export default function AdminBibliotecaPage() {
  const router = useRouter()
  const [books, setBooks] = useState<AdminBook[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function fetchBooks() {
    const res = await fetch('/api/admin/biblioteca')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setBooks(data.books ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchBooks() }, [])

  async function update(bookId: string, source: 'audible' | 'manual', patch: { visible?: boolean; status?: BookStatus }) {
    const prev = books.find(b => b.id === bookId)
    setSaving(bookId)
    setBooks(bs => bs.map(b => b.id === bookId ? { ...b, ...patch } : b))
    const endpoint = source === 'manual'
      ? `/api/admin/manual-books/${bookId}`
      : `/api/admin/biblioteca/${bookId}`
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setSaving(null)
    if (!res.ok) {
      if (prev) setBooks(bs => bs.map(b => b.id === bookId ? prev : b))
      return
    }
    setSaved(bookId)
    setTimeout(() => setSaved(s => s === bookId ? null : s), 1500)
  }

  async function deleteBook(id: string) {
    setBooks(bs => bs.filter(b => b.id !== id))
    await fetch(`/api/admin/manual-books/${id}`, { method: 'DELETE' })
  }

  const filtered = books.filter(b =>
    search === '' ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.authors.some(a => a.toLowerCase().includes(search.toLowerCase()))
  )
  const hiddenCount = books.filter(b => !b.visible).length

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-text">Biblioteca</h1>
        <Link
          href="/admin/biblioteca/add"
          className="font-mono text-xs border border-border text-text-secondary px-3 py-1.5 rounded-sm hover:border-accent hover:text-accent transition-colors"
        >
          + Agregar libro
        </Link>
      </div>
      <p className="font-mono text-xs text-text-muted mb-8">
        // {books.length} libros · {hiddenCount} ocultos
      </p>

      {loading ? (
        <p className="font-mono text-xs text-text-muted">// cargando...</p>
      ) : (
        <>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="buscar por título o autor..."
            className="w-full font-mono text-xs bg-surface border border-border rounded-sm px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-accent mb-6"
          />

          <div className="space-y-2">
            {filtered.map(book => (
              <BookRow
                key={book.id}
                book={book}
                saving={saving === book.id}
                saved={saved === book.id}
                onUpdate={update}
                onDelete={deleteBook}
              />
            ))}
            {filtered.length === 0 && (
              <p className="font-mono text-xs text-text-muted">// sin resultados</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function BookRow({
  book, saving, saved, onUpdate, onDelete,
}: {
  book: AdminBook
  saving: boolean
  saved: boolean
  onUpdate: (id: string, source: 'audible' | 'manual', patch: { visible?: boolean; status?: BookStatus }) => void
  onDelete: (id: string) => void
}) {
  const hours = Math.floor(book.runtime_length_min / 60)
  const minutes = book.runtime_length_min % 60

  return (
    <div
      className={`flex items-center gap-3 border rounded-sm p-3 transition-all ${
        saved ? 'border-accent/50 bg-accent/5'
          : book.visible ? 'border-border bg-surface'
          : 'border-border bg-surface opacity-50'
      }`}
    >
      {book.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={book.cover_url} alt="" className="w-8 h-10 object-cover rounded-sm shrink-0" />
      ) : (
        <div className="w-8 h-10 bg-background rounded-sm shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-xs font-semibold text-text truncate">{book.title}</p>
          {book.source === 'manual' && book.source_type && (
            <span className="font-mono text-[9px] text-text-muted border border-border px-1 rounded-sm shrink-0">
              {SOURCE_TYPE_LABEL[book.source_type] ?? book.source_type}
            </span>
          )}
        </div>
        <p className="font-mono text-[10px] text-text-muted truncate">
          {book.authors.join(', ')}
          {book.runtime_length_min > 0 && ` · ${hours}h ${minutes}m`}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/admin/biblioteca/${book.id}/notes`}
          className="font-mono text-[10px] text-text-muted hover:text-accent transition-colors"
        >
          notas →
        </Link>

        <select
          value={book.status}
          onChange={e => onUpdate(book.id, book.source, { status: e.target.value as BookStatus })}
          disabled={saving}
          className="font-mono text-[10px] bg-background border border-border rounded-sm px-2 py-1 text-text-secondary focus:outline-none focus:border-accent disabled:opacity-50"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={() => onUpdate(book.id, book.source, { visible: !book.visible })}
          disabled={saving}
          className={`font-mono text-[10px] px-2 py-1 rounded-sm border transition-colors disabled:opacity-50 ${
            book.visible
              ? 'border-accent text-accent hover:bg-accent/10'
              : 'border-border text-text-muted hover:border-accent hover:text-accent'
          }`}
        >
          {saving ? '...' : book.visible ? 'visible' : 'oculto'}
        </button>

        {book.source === 'manual' && (
          <button
            onClick={() => onDelete(book.id)}
            className="font-mono text-[10px] text-red-400 hover:underline"
          >
            delete
          </button>
        )}
      </div>
    </div>
  )
}
