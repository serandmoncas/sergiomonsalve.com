import { useLocale, useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA, NodoDiscurso } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

// Texto 14,5 en un viewBox de 420 => 11,3 px reales en un contenedor de 328 px.
const W = 420
const H = 500
const FUENTE = 14.5
const CX = 210
const RX = 55
const MARGEN_Y = 24
const MAX_CHARS = 16

/** Envuelve una etiqueta en líneas de a lo sumo MAX_CHARS caracteres. */
function envolver(s: string): string[] {
  const out: string[] = []
  let actual = ''
  for (const p of s.split(' ')) {
    if (actual && (actual + ' ' + p).length > MAX_CHARS) { out.push(actual); actual = p }
    else actual = actual ? `${actual} ${p}` : p
  }
  if (actual) out.push(actual)
  return out
}

/**
 * Los nodos vienen en orden de anillo: la primera mitad baja por la derecha y
 * la segunda sube por la izquierda. Se dibujan sobre una elipse alta con las
 * etiquetas hacia afuera, para que ninguna se recorte ni choque con otra.
 */
function posicion(i: number, total: number) {
  const derecha = i < Math.ceil(total / 2)
  const cuantos = derecha ? Math.ceil(total / 2) : Math.floor(total / 2)
  const k = derecha ? i : i - Math.ceil(total / 2)
  const t = cuantos > 1 ? (derecha ? k / (cuantos - 1) : 1 - k / (cuantos - 1)) : 0.5
  const y = MARGEN_Y + t * (H - 2 * MARGEN_Y)
  const u = 2 * t - 1
  const dx = RX * Math.sqrt(Math.max(0, 1 - u * u * 0.9))
  return { derecha, x: derecha ? CX + dx : CX - dx, y }
}

export default function MapaDiscurso({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.discurso')
  const tg = useTranslations('autorretrato')
  const en = useLocale() === 'en'
  const g = datos.grafoDiscurso
  const etiqueta = (n: NodoDiscurso) => (en ? n.etiquetaEn : n.etiqueta)
  const pos = new Map(g.nodos.map((n, i) => [n.id, posicion(i, g.nodos.length)]))
  const porId = new Map(g.nodos.map(n => [n.id, n]))
  const nombre = (id: string) => { const n = porId.get(id); return n ? etiqueta(n) : id }
  const resaltados = g.nodos.filter(n => n.resaltado).length
  return (
    <Figura
      id="mapa-discurso"
      titulo={t('titulo')}
      resumen={t('resumen', { resaltados, total: g.nodos.length })}
      etiquetaDatos={tg('verDatos')}
      tabla={{
        columnas: [t('concepto'), t('relacion'), t('concepto')],
        filas: g.aristas.map(a => [nombre(a.de), a.motivo, nombre(a.a)]),
      }}
      pie={
        <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary list-none p-0">
          <li className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="var(--color-accent)" /></svg>
            {t('enMisPrompts')}
          </li>
          <li className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill="var(--color-background)" stroke="var(--color-text-secondary)" strokeWidth="1.5" /></svg>
            {t('otros')}
          </li>
        </ul>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true">
        {g.aristas.map(a => {
          const de = pos.get(a.de)
          const ha = pos.get(a.a)
          if (!de || !ha) return null
          return <line key={`${a.de}-${a.a}`} x1={de.x} y1={de.y} x2={ha.x} y2={ha.y} stroke="var(--color-text-muted)" strokeOpacity={0.5}>
            <title>{a.motivo}</title>
          </line>
        })}
        {g.nodos.map(n => {
          const p = pos.get(n.id)!
          const ls = envolver(etiqueta(n))
          const tx = p.x + (p.derecha ? 11 : -11)
          return (
            <g key={n.id} data-nodo={n.id} data-resaltado={String(n.resaltado)}>
              <title>{etiqueta(n)}</title>
              <circle cx={p.x} cy={p.y} r={6} fill={n.resaltado ? 'var(--color-accent)' : 'var(--color-background)'} stroke={n.resaltado ? 'none' : 'var(--color-text-secondary)'} strokeWidth={1.5} />
              <text x={tx} y={p.y + 5 - ((ls.length - 1) * 16) / 2} textAnchor={p.derecha ? 'start' : 'end'} fontSize={FUENTE}
                fill={n.resaltado ? 'var(--color-text)' : 'var(--color-text-secondary)'}>
                {ls.map((l, i) => <tspan key={i} x={tx} dy={i === 0 ? 0 : 16}>{l}</tspan>)}
              </text>
            </g>
          )
        })}
      </svg>
    </Figura>
  )
}
