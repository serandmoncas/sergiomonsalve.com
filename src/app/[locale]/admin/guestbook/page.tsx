'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type Entry = {
  id: string
  display_name: string
  avatar_url: string | null
  provider: string
  message: string
  approved: boolean
  created_at: string
}

export default function AdminGuestbookPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/admin/guestbook')
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function setApproved(id: string, approved: boolean) {
    await fetch(`/api/admin/guestbook/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    })
    setEntries(prev => prev.map(e => e.id === id ? { ...e, approved } : e))
  }

  async function remove(id: string) {
    await fetch(`/api/admin/guestbook/${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  if (loading) return <p className="font-mono text-xs text-text-muted">// cargando...</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-text mb-1">Firmas</h1>
      <p className="font-mono text-xs text-text-muted mb-8">// libro de firmas</p>

      {entries.length === 0 && (
        <p className="font-mono text-xs text-text-muted">No hay entradas.</p>
      )}

      <div className="space-y-4">
        {entries.map(entry => (
          <div
            key={entry.id}
            className={`border rounded-sm p-4 ${entry.approved ? 'border-accent/30 bg-surface' : 'border-border bg-background'}`}
          >
            <div className="flex items-start gap-3">
              {entry.avatar_url ? (
                <Image src={entry.avatar_url} alt={entry.display_name} width={32} height={32} className="rounded-full flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-text">{entry.display_name}</span>
                  <span className="font-mono text-[10px] text-text-muted border border-border px-1.5 py-px rounded-sm uppercase">{entry.provider}</span>
                  <span className="font-mono text-[10px] text-text-muted">{new Date(entry.created_at).toLocaleString('es-CO')}</span>
                  {entry.approved && (
                    <span className="font-mono text-[10px] text-accent border border-accent/40 px-1.5 py-px rounded-sm">aprobado</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">{entry.message}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-3 justify-end">
              {entry.approved ? (
                <button
                  onClick={() => setApproved(entry.id, false)}
                  className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
                >
                  Ocultar
                </button>
              ) : (
                <button
                  onClick={() => setApproved(entry.id, true)}
                  className="font-mono text-xs text-accent hover:opacity-80 transition-opacity"
                >
                  Aprobar
                </button>
              )}
              <button
                onClick={() => remove(entry.id)}
                className="font-mono text-xs text-red-400 hover:opacity-80 transition-opacity"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
