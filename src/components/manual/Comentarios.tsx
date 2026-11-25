'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

type Comentario = { id: string; author_name: string; body: string; created_at: string; mine: boolean }

export function Comentarios({ slug }: { slug: string }) {
  const t = useTranslations('manual.comentarios')
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<'cargar' | 'enviar' | null>(null)

  useEffect(() => {
    let vivo = true
    fetch(`/api/manual/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load'))))
      .then((j) => { if (vivo) setComentarios(j.comments) })
      .catch(() => { if (vivo) setError('cargar') })
    return () => { vivo = false }
  }, [slug])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim() || enviando) return
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/manual/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_slug: slug, body: texto })
      })
      if (!res.ok) throw new Error('send')
      const { comment } = await res.json()
      setComentarios((c) => [...c, comment])
      setTexto('')
    } catch {
      setError('enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="my-8 border-t border-border pt-6">
      <p className="font-mono text-xs text-accent mb-4">{t('titulo')}</p>
      {comentarios.length === 0 && error !== 'cargar' && (
        <p className="text-sm text-text-muted mb-4">{t('vacio')}</p>
      )}
      <ul className="space-y-4 mb-6">
        {comentarios.map((c) => (
          <li key={c.id} className="text-sm">
            <p className="font-mono text-xs text-text-muted">
              {c.author_name}{c.mine ? ` (${t('tu')})` : ''} · {new Date(c.created_at).toLocaleDateString('es')}
            </p>
            <p className="whitespace-pre-wrap">{c.body}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={enviar} className="space-y-3">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={4000}
          rows={4}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          className="w-full bg-surface border border-border p-3 text-sm"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="font-mono text-xs text-accent hover:underline disabled:opacity-50"
        >
          {enviando ? t('enviando') : t('enviar')}
        </button>
        {error && <p role="alert" className="text-sm text-red-400">{error === 'cargar' ? t('errorCargar') : t('errorEnviar')}</p>}
      </form>
    </section>
  )
}
