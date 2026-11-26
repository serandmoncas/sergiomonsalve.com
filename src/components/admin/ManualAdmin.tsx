'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'

type Reader = { email: string; name: string; note: string | null; invited_at: string }
type ManualComment = {
  id: string
  note_slug: string
  author_name: string
  author_email: string
  body: string
  created_at: string
}
type Contenido =
  | { ok: true; rotas: { slug: string; error: string }[]; huerfanas: string[] }
  | { ok: false }

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-CO')

export default function ManualAdmin({ contenido }: { contenido: Contenido }) {
  const router = useRouter()
  const [readers, setReaders] = useState<Reader[]>([])
  const [comments, setComments] = useState<ManualComment[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const [r, c] = await Promise.all([
        fetch('/api/admin/manual/readers'),
        fetch('/api/admin/manual/comments'),
      ])
      if (r.status === 401 || c.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!r.ok || !c.ok) {
        setAviso('No se pudo cargar la lista de lectores o comentarios.')
      } else {
        setReaders((await r.json()).readers ?? [])
        setComments((await c.json()).comments ?? [])
      }
    } catch {
      setAviso('No se pudo cargar la lista de lectores o comentarios.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [cargar])

  async function invitar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setAviso('')
    try {
      const res = await fetch('/api/admin/manual/readers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, note: note || undefined }),
      })
      if (!res.ok) {
        setAviso('Revisa el correo y el nombre (1 a 80 caracteres).')
        return
      }
      const data = await res.json()
      if (data.invited) {
        setAviso(data.existed ? 'Invitación enviada (ya tenía cuenta).' : 'Invitación enviada.')
      } else if (data.error === 'cuenta') {
        setAviso('Lector guardado, pero no se pudo crear su cuenta. Vuelve a invitarlo.')
      } else {
        setAviso('Lector guardado, pero no se pudo enviar el correo. Vuelve a invitarlo.')
      }
      setEmail('')
      setName('')
      setNote('')
      await cargar()
    } catch {
      setAviso('Error de red: no se pudo invitar.')
    } finally {
      setEnviando(false)
    }
  }

  async function quitarLector(correo: string) {
    if (!confirm(`¿Quitar a ${correo}?`)) return
    try {
      const res = await fetch(`/api/admin/manual/readers?email=${encodeURIComponent(correo)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete')
      setReaders(rs => rs.filter(r => r.email !== correo))
    } catch {
      setAviso(`No se pudo quitar a ${correo}. Sigue con acceso.`)
    }
  }

  async function borrarComentario(id: string) {
    try {
      const res = await fetch(`/api/admin/manual/comments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete')
      setComments(cs => cs.filter(c => c.id !== id))
    } catch {
      setAviso('No se pudo borrar el comentario.')
    }
  }

  async function refrescar() {
    try {
      const res = await fetch('/api/admin/manual/refresh', { method: 'POST' })
      setAviso(res.ok ? 'Contenido refrescado.' : 'No se pudo refrescar.')
      if (res.ok) router.refresh()
    } catch {
      setAviso('Error de red: no se pudo refrescar.')
    }
  }

  const input =
    'bg-surface border border-border rounded-sm px-2 py-1.5 font-mono text-xs text-text w-full'

  return (
    <div>
      <h1 className="text-xl font-bold text-text mb-1">Manual</h1>
      <p className="font-mono text-xs text-text-muted mb-8">{'//'} lectores, comentarios y contenido</p>

      {aviso && <p role="status" className="font-mono text-xs text-accent mb-6">{aviso}</p>}

      <section className="mb-10">
        <p className="font-mono text-xs text-accent mb-4">{'//'} invitar lector</p>
        <form onSubmit={invitar} className="grid gap-2 sm:grid-cols-2 max-w-xl">
          <input className={input} type="email" required placeholder="correo" aria-label="Correo"
            value={email} onChange={e => setEmail(e.target.value)} />
          <input className={input} required maxLength={80} placeholder="nombre" aria-label="Nombre"
            value={name} onChange={e => setName(e.target.value)} />
          <input className={`${input} sm:col-span-2`} maxLength={500} placeholder="nota (opcional)" aria-label="Nota"
            value={note} onChange={e => setNote(e.target.value)} />
          <button type="submit" disabled={enviando}
            className="font-mono text-xs px-3 py-1.5 rounded-sm border border-accent/40 text-accent hover:bg-accent/10 disabled:opacity-50 w-fit">
            {enviando ? 'Enviando...' : 'Invitar'}
          </button>
        </form>
      </section>

      <section className="mb-10">
        <p className="font-mono text-xs text-accent mb-4">{'//'} lectores ({readers.length})</p>
        {loading ? (
          <p className="font-mono text-xs text-text-muted">{'//'} cargando...</p>
        ) : readers.length === 0 ? (
          <p className="font-mono text-xs text-text-muted">{'//'} sin lectores</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {readers.map(r => (
              <li key={r.email} className="flex items-center justify-between gap-3 border border-border rounded-sm px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-text truncate">{r.name} <span className="font-mono text-xs text-text-muted">{r.email}</span></p>
                  <p className="font-mono text-[10px] text-text-muted">invitado el {fecha(r.invited_at)}{r.note ? ` · ${r.note}` : ''}</p>
                </div>
                <button onClick={() => quitarLector(r.email)}
                  className="font-mono text-xs text-text-muted hover:text-red-500 transition-colors">
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <p className="font-mono text-xs text-accent mb-4">{'//'} últimos comentarios ({comments.length})</p>
        {!loading && comments.length === 0 ? (
          <p className="font-mono text-xs text-text-muted">{'//'} sin comentarios</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {comments.map(c => (
              <li key={c.id} className="border border-border rounded-sm px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-[10px] text-text-muted">
                    {c.author_name} · {c.author_email} · {fecha(c.created_at)} · nota: {c.note_slug}
                  </p>
                  <button onClick={() => borrarComentario(c.id)}
                    className="font-mono text-xs text-text-muted hover:text-red-500 transition-colors">
                    Borrar
                  </button>
                </div>
                <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center gap-4 mb-4">
          <p className="font-mono text-xs text-accent">{'//'} contenido</p>
          <button onClick={refrescar}
            className="font-mono text-xs px-3 py-1 rounded-sm border border-accent/40 text-accent hover:bg-accent/10">
            Refrescar contenido
          </button>
        </div>
        {!contenido.ok ? (
          <p className="font-mono text-xs text-text-muted">{'//'} contenido no disponible</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] text-text-muted uppercase mb-2">notas rotas ({contenido.rotas.length})</p>
              {contenido.rotas.length === 0 ? (
                <p className="font-mono text-xs text-text-muted">ninguna</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {contenido.rotas.map(r => (
                    <li key={r.slug} className="font-mono text-xs text-text-secondary">{r.slug}: {r.error}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] text-text-muted uppercase mb-2">notas huérfanas ({contenido.huerfanas.length})</p>
              {contenido.huerfanas.length === 0 ? (
                <p className="font-mono text-xs text-text-muted">ninguna</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {contenido.huerfanas.map(s => (
                    <li key={s} className="font-mono text-xs text-text-secondary">{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
