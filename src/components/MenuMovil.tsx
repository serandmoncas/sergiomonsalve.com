'use client'

import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, usePathname } from '@/i18n/navigation'

export type ItemMenu = { href: string; label: string; estatico?: boolean }
export type GrupoMenu = { titulo?: string; items: ItemMenu[] }

type Props = { grupos: GrupoMenu[]; textos: { abrir: string; cerrar: string } }

const claseEnlace = 'block py-2 text-sm text-text-secondary hover:text-text transition-colors'

/** Menú del celular y la tablet (< lg): botón ☰ que abre un panel con todas las opciones, agrupadas. */
export default function MenuMovil({ grupos, textos }: Props) {
  const pathname = usePathname()
  // Se guarda la página donde se abrió: al navegar a otra, el menú queda cerrado sin un efecto extra.
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null)
  const [arriba, setArriba] = useState(57) // borde inferior del menú, en px
  const [destino, setDestino] = useState<Element | null>(null) // contenedor de la piel (data-skin)
  const abierto = abiertoEn === pathname
  const idPanel = useId()
  const cerrar = () => setAbiertoEn(null)

  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbiertoEn(null) }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto])

  return (
    <>
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={idPanel}
        aria-label={abierto ? textos.cerrar : textos.abrir}
        onClick={(e) => {
          setArriba(e.currentTarget.closest('nav')?.getBoundingClientRect().bottom ?? 57)
          setDestino(e.currentTarget.closest('[data-skin]') ?? document.body)
          setAbiertoEn(abierto ? null : pathname)
        }}
        className="font-mono text-lg leading-none text-text-secondary hover:text-accent transition-colors px-1"
      >
        {abierto ? '✕' : '☰'}
      </button>
      {/* Portal fuera del <nav>: su backdrop-blur haría que un `fixed` dentro de él se posicione
          relativo al nav (y quede de 0 px de alto). Va al contenedor de la piel (data-skin) para
          heredar sus colores; si no lo hay, a <body>. */}
      {abierto && createPortal(
        <div
          id={idPanel}
          style={{ top: arriba }}
          className="fixed left-0 right-0 bottom-0 z-40 overflow-y-auto border-t border-border bg-background px-6 py-4"
        >
          {grupos.map((grupo, i) => (
            <div key={grupo.titulo ?? i} className={i > 0 ? 'mt-3 pt-3 border-t border-border' : ''}>
              {grupo.titulo && (
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-1">{grupo.titulo}</p>
              )}
              <ul>
                {grupo.items.map(item => (
                  <li key={item.href}>
                    {/* Páginas estáticas de public/ van con <a>: no pasan por las rutas con idioma */}
                    {item.estatico
                      ? <a href={item.href} onClick={cerrar} className={claseEnlace}>{item.label}</a>
                      : <Link href={item.href} onClick={cerrar} className={claseEnlace}>{item.label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>,
        destino ?? document.body,
      )}
    </>
  )
}
