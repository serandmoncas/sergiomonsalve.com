'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { forceCenter, forceLink, forceManyBody, forceSimulation, forceX, forceY, type Simulation } from 'd3-force'
import { Link } from '@/i18n/navigation'
import { notaHref } from '@/lib/manual/paths'
import type { Grafo as GrafoData } from '@/lib/manual/types'

type Punto = { id: string; x: number; y: number }
type NodoSim = Punto & { fx?: number | null; fy?: number | null }

const ANCHO = 600
const R_NORMAL = 7
const R_ACTUAL = 11

// Posiciones iniciales en círculo: sirven para el primer render (y el SSR)
// antes de que la simulación calcule las definitivas.
function enCirculo(grafo: GrafoData, alto: number): Punto[] {
  const n = Math.max(grafo.nodes.length, 1)
  return grafo.nodes.map((nodo, i) => ({
    id: nodo.id,
    x: ANCHO / 2 + Math.cos((2 * Math.PI * i) / n) * 120,
    y: alto / 2 + Math.sin((2 * Math.PI * i) / n) * 90,
  }))
}

export function Grafo({ grafo, actual, compacto = false }: { grafo: GrafoData; actual?: string; compacto?: boolean }) {
  const t = useTranslations('manual')
  const alto = compacto ? 260 : 460
  const [puntos, setPuntos] = useState<Punto[]>(() => enCirculo(grafo, alto))
  const svgRef = useRef<SVGSVGElement>(null)
  const simRef = useRef<Simulation<NodoSim, undefined> | null>(null)
  const nodosRef = useRef<NodoSim[]>([])
  const fotoRef = useRef<() => void>(() => {})
  const sinMovimientoRef = useRef(false)
  const arrastre = useRef<{ id: string; movio: boolean } | null>(null)

  useEffect(() => {
    // d3 muta los objetos: se le dan copias.
    const nodos: NodoSim[] = enCirculo(grafo, alto)
    const enlaces = grafo.links.map((l) => ({ source: l.source, target: l.target }))
    nodosRef.current = nodos
    const sim = forceSimulation<NodoSim>(nodos)
      .force('link', forceLink<NodoSim, { source: string; target: string }>(enlaces).id((d) => d.id).distance(compacto ? 70 : 90))
      .force('charge', forceManyBody().strength(compacto ? -120 : -180))
      .force('center', forceCenter(ANCHO / 2, alto / 2))
      // Atraen suavemente al centro para que las notas sueltas no salgan del recuadro.
      .force('x', forceX(ANCHO / 2).strength(0.05))
      .force('y', forceY(alto / 2).strength(0.05))
    simRef.current = sim
    const sinMovimiento = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sinMovimientoRef.current = sinMovimiento
    const limitar = (v: number, max: number) => Math.min(Math.max(v, R_ACTUAL), max - R_ACTUAL)
    const foto = () => setPuntos(nodos.map((n) => ({ id: n.id, x: limitar(n.x, ANCHO), y: limitar(n.y, alto) })))
    fotoRef.current = foto
    if (sinMovimiento) {
      // Sin animar: se corre todo y se dibuja el estado final.
      sim.stop()
      sim.tick(300)
      foto()
    } else {
      sim.on('tick', foto)
    }
    return () => {
      sim.stop()
      simRef.current = null
    }
  }, [grafo, alto, compacto])

  const pos = useMemo(() => new Map(puntos.map((p) => [p.id, p])), [puntos])
  const ahora = (id: string) => pos.get(id) ?? { id, x: ANCHO / 2, y: alto / 2 }

  // Arrastre del nodo actual con pointer events (sirve en móvil).
  const coords = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * ANCHO, y: ((e.clientY - r.top) / r.height) * alto }
  }
  const onDown = (e: React.PointerEvent<SVGGElement>, id: string) => {
    arrastre.current = { id, movio: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    // Con reduced-motion no se reinicia la simulación animada.
    if (!sinMovimientoRef.current) simRef.current?.alphaTarget(0.3).restart()
  }
  const onMove = (e: React.PointerEvent) => {
    const a = arrastre.current
    if (!a) return
    a.movio = true
    const nodo = nodosRef.current.find((n) => n.id === a.id)
    if (!nodo) return
    const c = coords(e)
    nodo.fx = c.x
    nodo.fy = c.y
    if (sinMovimientoRef.current) {
      simRef.current?.tick()
      fotoRef.current()
    }
  }
  const onUp = () => {
    const a = arrastre.current
    if (!a) return
    const nodo = nodosRef.current.find((n) => n.id === a.id)
    if (nodo) {
      nodo.fx = null
      nodo.fy = null
    }
    simRef.current?.alphaTarget(0)
    // Si hubo arrastre, el clic siguiente no debe navegar.
    setTimeout(() => (arrastre.current = null), 0)
  }

  const existentes = grafo.nodes.filter((n) => n.existe)

  return (
    <div data-compacto={compacto ? '' : undefined} className="w-full">
      <svg
        ref={svgRef}
        role="img"
        aria-label={t('grafo.titulo')}
        viewBox={`0 0 ${ANCHO} ${alto}`}
        className="w-full h-auto select-none"
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <title>{t('grafo.titulo')}</title>
        <g stroke="currentColor" className="text-border" strokeWidth={1}>
          {grafo.links.map((l, i) => {
            const a = ahora(l.source)
            const b = ahora(l.target)
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          })}
        </g>
        {grafo.nodes.map((n) => {
          const p = ahora(n.id)
          const esActual = n.id === actual
          const r = esActual ? R_ACTUAL : R_NORMAL
          const etiqueta = (
            <text x={p.x + r + 4} y={p.y + 4} fontSize={11} className="fill-text-muted font-mono" pointerEvents="none">
              {n.titulo}
            </text>
          )
          if (!n.existe) {
            return (
              <g key={n.id} data-fantasma="">
                <circle cx={p.x} cy={p.y} r={r} className="fill-text-muted" opacity={0.5} />
                {etiqueta}
              </g>
            )
          }
          const circulo = (
            <circle
              data-actual={esActual ? '' : undefined}
              cx={p.x}
              cy={p.y}
              r={r}
              className="fill-accent"
              stroke={esActual ? 'currentColor' : undefined}
              strokeWidth={esActual ? 2 : 0}
            />
          )
          return (
            <g key={n.id} onPointerDown={esActual ? (e) => onDown(e, n.id) : undefined} className={esActual ? 'cursor-grab touch-none' : undefined}>
              <Link
                href={notaHref(n.id)}
                aria-label={n.titulo}
                prefetch={false}
                tabIndex={-1}
                aria-current={esActual ? 'page' : undefined}
                onClick={(e: React.MouseEvent) => {
                  if (arrastre.current?.movio) e.preventDefault()
                }}
                className="cursor-pointer"
              >
                {circulo}
              </Link>
              {etiqueta}
            </g>
          )
        })}
      </svg>
      {/* Lista equivalente para teclado y lectores de pantalla. */}
      <ul>
        {existentes.map((n) => (
          <li key={n.id}>
            <Link href={notaHref(n.id)} prefetch={false} className="sr-only focus:not-sr-only focus:absolute focus:bg-surface focus:text-accent focus:px-2 focus:py-1">{n.titulo}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
