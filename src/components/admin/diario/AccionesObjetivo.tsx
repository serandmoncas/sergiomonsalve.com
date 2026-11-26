'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Tarjeta = { texto: string; nombre: string; desde: string | null }
type Columna = { nombre: string; tarjetas: Tarjeta[] }

/** `[[Nombre|alias]]` → `alias`, `[[Nombre]]` → `Nombre`. */
const legible = (t: string) => t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, n: string, a?: string) => a ?? n)

const campo = 'w-full bg-surface border border-border rounded px-2 py-1 text-sm text-text'

/**
 * Lo que se toca del objetivo (DI-087): agregar un contacto, mover una tarjeta
 * y deshacer. Cada acción va al servidor y, si se guardó, la página se recarga
 * con el archivo nuevo; si no, se muestra por qué y nada cambia.
 */
export default function AccionesObjetivo({ objetivoId, columnas }: { objetivoId: string; columnas: Columna[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [nuevo, setNuevo] = useState({ nombre: '', canal: '', nota: '' })

  async function enviar(accion: Record<string, string>): Promise<boolean> {
    setEnviando(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/diario/objetivo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ objetivo: objetivoId, ...accion }),
      })
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!r.ok || !j.ok) {
        setError(j.error ?? 'no se guardó')
        return false
      }
      router.refresh()
      return true
    } catch {
      setError('no se guardó')
      return false
    } finally {
      setEnviando(false)
    }
  }

  async function agregar(e: FormEvent) {
    e.preventDefault()
    if (await enviar({ tipo: 'contacto', ...nuevo })) setNuevo({ nombre: '', canal: '', nota: '' })
  }

  return (
    <div>
      <form onSubmit={agregar} className="grid gap-2 mb-4 sm:grid-cols-4 sm:items-end">
        <label className="text-xs text-text-secondary">
          A quién
          <input required className={campo} value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} />
        </label>
        <label className="text-xs text-text-secondary">
          Canal
          <input className={campo} value={nuevo.canal} onChange={e => setNuevo({ ...nuevo, canal: e.target.value })} />
        </label>
        <label className="text-xs text-text-secondary">
          Nota
          <input className={campo} value={nuevo.nota} onChange={e => setNuevo({ ...nuevo, nota: e.target.value })} />
        </label>
        <button type="submit" disabled={enviando} className="font-mono text-xs border border-accent text-accent rounded px-3 py-2 disabled:opacity-50">
          Agregar contacto
        </button>
      </form>
      <div className="flex items-center gap-4 mb-6">
        <button type="button" disabled={enviando} onClick={() => enviar({ tipo: 'deshacer' })} className="font-mono text-xs text-text-secondary hover:text-accent disabled:opacity-50">
          Deshacer
        </button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {columnas.map(c => (
          <section key={c.nombre} aria-label={c.nombre} className="border border-border rounded p-3">
            <h3 className="font-mono text-xs text-accent mb-2">
              {c.nombre} <span className="text-text-secondary">{c.tarjetas.length}</span>
            </h3>
            <ul className="flex flex-col gap-2">
              {c.tarjetas.map(t => {
                const nombre = legible(t.nombre)
                return (
                  <li key={t.texto} className="text-sm text-text">
                    <span>{nombre}</span>
                    {t.desde && <span className="block font-mono text-xs text-text-secondary">desde {t.desde}</span>}
                    <select
                      aria-label={`Mover ${nombre} a`}
                      disabled={enviando}
                      value=""
                      onChange={e => e.target.value && enviar({ tipo: 'mover', texto: t.texto, a: e.target.value })}
                      className={`${campo} mt-1`}
                    >
                      <option value="">mover a…</option>
                      {columnas
                        .filter(x => x.nombre !== c.nombre)
                        .map(x => (
                          <option key={x.nombre} value={x.nombre}>{x.nombre}</option>
                        ))}
                    </select>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
