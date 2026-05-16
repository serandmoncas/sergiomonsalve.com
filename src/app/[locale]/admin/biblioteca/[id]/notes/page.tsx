'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import ReactMarkdown from 'react-markdown'

type Notes = {
  rating: number | null
  highlights: string[]
  review_md: string
}

export default function BookNotesPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = params.id
  const bookTitle = searchParams.get('title') ?? 'Libro'

  const [notes, setNotes] = useState<Notes>({ rating: null, highlights: [], review_md: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [newHighlight, setNewHighlight] = useState('')
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    fetch(`/api/admin/book-notes/${id}`)
      .then(r => r.json())
      .then(data => { setNotes(data); setLoading(false) })
  }, [id])

  async function save() {
    setSaving(true)
    setSavedMsg('')
    const res = await fetch(`/api/admin/book-notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes),
    })
    setSaving(false)
    setSavedMsg(res.ok ? '✓ Guardado' : 'Error al guardar')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  function setRating(r: number) {
    setNotes(n => ({ ...n, rating: n.rating === r ? null : r }))
  }

  function addHighlight() {
    const h = newHighlight.trim()
    if (!h) return
    setNotes(n => ({ ...n, highlights: [...n.highlights, h] }))
    setNewHighlight('')
  }

  function removeHighlight(i: number) {
    setNotes(n => ({ ...n, highlights: n.highlights.filter((_, idx) => idx !== i) }))
  }

  if (loading) return <p className="font-mono text-xs text-text-muted">// cargando...</p>

  return (
    <div>
      <Link
        href="/admin/biblioteca"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-8 block"
      >
        ← Biblioteca
      </Link>

      <h1 className="text-xl font-bold text-text mb-1">Notas</h1>
      <p className="font-mono text-xs text-text-muted mb-8 truncate">// {bookTitle}</p>

      <section className="mb-8">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-3">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`text-xl transition-colors ${n <= (notes.rating ?? 0) ? 'text-accent' : 'text-border hover:text-accent/50'}`}
            >
              ★
            </button>
          ))}
          {notes.rating !== null && (
            <button
              onClick={() => setNotes(n => ({ ...n, rating: null }))}
              className="font-mono text-[10px] text-text-muted hover:text-red-400 ml-2 transition-colors"
            >
              limpiar
            </button>
          )}
        </div>
      </section>

      <section className="mb-8">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-3">Highlights</p>
        <div className="space-y-2 mb-3">
          {notes.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 group">
              <p className="flex-1 text-xs text-text-secondary italic border-l-2 border-accent pl-3 py-0.5">{h}</p>
              <button
                onClick={() => removeHighlight(i)}
                className="font-mono text-[10px] text-text-muted hover:text-red-400 transition-colors shrink-0 mt-0.5"
              >
                ×
              </button>
            </div>
          ))}
          {notes.highlights.length === 0 && (
            <p className="font-mono text-xs text-text-muted">// sin highlights</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newHighlight}
            onChange={e => setNewHighlight(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addHighlight() }}
            placeholder="Agregar cita..."
            className="flex-1 font-mono text-xs bg-surface border border-border rounded-sm px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          <button
            onClick={addHighlight}
            className="font-mono text-xs border border-border text-text-secondary px-3 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Agregar
          </button>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Reseña</p>
          <div className="flex gap-1">
            {(['edit', 'preview'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`font-mono text-[10px] px-2 py-0.5 rounded-sm transition-colors ${
                  tab === t ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text'
                }`}
              >
                {t === 'edit' ? 'editar' : 'preview'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'edit' ? (
          <textarea
            value={notes.review_md}
            onChange={e => setNotes(n => ({ ...n, review_md: e.target.value }))}
            rows={10}
            placeholder="Escribe tu reseña en Markdown..."
            className="w-full font-mono text-xs bg-surface border border-border rounded-sm px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-accent resize-y"
          />
        ) : (
          <div className="mdx-prose min-h-[10rem] border border-border rounded-sm p-4 bg-surface">
            {notes.review_md
              ? <ReactMarkdown>{notes.review_md}</ReactMarkdown>
              : <p className="font-mono text-xs text-text-muted">// sin contenido</p>
            }
          </div>
        )}
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="font-mono text-xs bg-accent text-background px-4 py-2 rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar notas'}
        </button>
        {savedMsg && (
          <span className="font-mono text-xs text-accent">{savedMsg}</span>
        )}
      </div>
    </div>
  )
}
