'use client'

import { useState, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'

type SearchResult = {
  title: string
  authors: string[]
  cover_url: string
  description: string
  isbn?: string
  published_year?: number
}

type Form = {
  title: string
  authors: string
  cover_url: string
  description: string
  source_type: 'physical' | 'ebook' | 'other'
  isbn: string
  published_year: string
}

const EMPTY_FORM: Form = {
  title: '', authors: '', cover_url: '', description: '',
  source_type: 'physical', isbn: '', published_year: '',
}

export default function AddBookPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function onQueryChange(q: string) {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/admin/book-search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch { setResults([]) }
      setSearching(false)
    }, 400)
  }

  function selectResult(result: SearchResult) {
    setForm({
      title: result.title,
      authors: result.authors.join(', '),
      cover_url: result.cover_url,
      description: result.description,
      source_type: 'physical',
      isbn: result.isbn ?? '',
      published_year: result.published_year?.toString() ?? '',
    })
    setResults([])
    setQuery('')
  }

  async function save() {
    if (!form.title.trim()) { setError('El título es requerido'); return }
    setSaving(true)
    setError('')
    const payload = {
      title: form.title.trim(),
      authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
      cover_url: form.cover_url.trim(),
      description: form.description.trim(),
      source_type: form.source_type,
      ...(form.isbn.trim() && { isbn: form.isbn.trim() }),
      ...(form.published_year.trim() && { published_year: parseInt(form.published_year) }),
    }
    const res = await fetch('/api/admin/manual-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      router.push('/admin/biblioteca')
    } else {
      setError('Error al guardar. Intenta de nuevo.')
      setSaving(false)
    }
  }

  return (
    <div>
      <Link
        href="/admin/biblioteca"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-8 block"
      >
        ← Biblioteca
      </Link>
      <h1 className="text-xl font-bold text-text mb-1">Agregar libro</h1>
      <p className="font-mono text-xs text-text-muted mb-8">// busca y selecciona, o llena el formulario</p>

      <div className="mb-6 relative">
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="buscar por título o autor..."
          className="w-full font-mono text-xs bg-surface border border-border rounded-sm px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        {searching && (
          <p className="font-mono text-xs text-text-muted mt-2">// buscando...</p>
        )}
        {results.length > 0 && (
          <div className="mt-2 border border-border rounded-sm bg-surface divide-y divide-border">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => selectResult(r)}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent/5 text-left transition-colors"
              >
                {r.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.cover_url} alt="" className="w-8 h-10 object-cover rounded-sm shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text truncate">{r.title}</p>
                  <p className="font-mono text-[10px] text-text-muted truncate">{r.authors.join(', ')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Field label="Título *">
          <input
            type="text" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
          />
        </Field>

        <Field label="Autores (separados por coma)">
          <input
            type="text" value={form.authors}
            onChange={e => setForm(f => ({ ...f, authors: e.target.value }))}
            className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
          />
        </Field>

        <Field label="URL portada">
          <input
            type="text" value={form.cover_url}
            onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))}
            className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
          />
        </Field>

        <Field label="Tipo">
          <div className="flex gap-3">
            {(['physical', 'ebook', 'other'] as const).map(t => (
              <label key={t} className="flex items-center gap-1.5 font-mono text-xs text-text-secondary cursor-pointer">
                <input
                  type="radio" name="source_type" value={t}
                  checked={form.source_type === t}
                  onChange={() => setForm(f => ({ ...f, source_type: t }))}
                />
                {t === 'physical' ? 'físico' : t}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Descripción">
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent resize-none"
          />
        </Field>

        <div className="flex gap-4">
          <Field label="ISBN">
            <input
              type="text" value={form.isbn}
              onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
              className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
            />
          </Field>
          <Field label="Año publicación">
            <input
              type="number" value={form.published_year}
              onChange={e => setForm(f => ({ ...f, published_year: e.target.value }))}
              className="w-full font-mono text-xs bg-background border border-border rounded-sm px-3 py-2 text-text focus:outline-none focus:border-accent"
            />
          </Field>
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="font-mono text-xs bg-accent text-background px-4 py-2 rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar libro'}
          </button>
          <Link
            href="/admin/biblioteca"
            className="font-mono text-xs border border-border text-text-secondary px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] text-text-muted mb-1.5">{label}</p>
      {children}
    </div>
  )
}
