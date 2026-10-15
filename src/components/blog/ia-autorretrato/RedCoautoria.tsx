import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA, Era, GrafoCoautoria, NodoGrafo } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

// Ancho 340 y texto 12 => 11,6 px reales en un contenedor de 328 px.
const W = 340
const H = 320
const FUENTE = 12
const X_IZQ = 130
const X_DER = 240

/** Parte una etiqueta larga en dos líneas por el primer espacio ("Claude Sonnet 4.6" → "Claude" / "Sonnet 4.6"). */
export function lineas(s: string): string[] {
  const i = s.indexOf(' ')
  return s.length > 12 && i > 0 ? [s.slice(0, i), s.slice(i + 1)] : [s]
}

function tituloEra(era: Era | undefined, cuenta: string): string {
  if (!era) return cuenta
  const d = era.desde.slice(0, 4)
  const h = era.hasta.slice(0, 4)
  return `${cuenta} · ${d === h ? d : `${d}–${h}`}`
}

function Panel({ grafo, titulo, etiqueta }: { grafo: GrafoCoautoria; titulo: string; etiqueta: (n: NodoGrafo) => string }) {
  const maxNodo = grafo.nodos.reduce((m, n) => Math.max(m, n.peso), 1)
  const maxArista = grafo.aristas.reduce((m, a) => Math.max(m, a.peso), 1)
  const radio = (n: NodoGrafo) => 3 + 6 * Math.sqrt(n.peso / maxNodo)
  // Se conserva la y normalizada de los datos; la x se remapea a dos columnas con holgura para las etiquetas.
  const px = (n: NodoGrafo) => (n.tipo === 'dominio' ? X_DER : X_IZQ)
  const py = (n: NodoGrafo) => 14 + n.y * (H - 28)
  const porId = new Map(grafo.nodos.map(n => [n.id, n]))
  return (
    <div data-era={grafo.era} className="w-full lg:w-[48%]">
      <p className="font-mono text-xs text-text-secondary mb-1">{titulo}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true">
        {grafo.aristas.map(a => {
          const de = porId.get(a.de)
          const ha = porId.get(a.a)
          if (!de || !ha) return null
          return <line key={`${a.de}-${a.a}`} x1={px(de)} y1={py(de)} x2={px(ha)} y2={py(ha)}
            stroke="var(--color-text-muted)" strokeOpacity={0.6} strokeWidth={0.5 + (3.5 * a.peso) / maxArista} />
        })}
        {grafo.nodos.map(n => {
          const esDominio = n.tipo === 'dominio'
          const r = radio(n)
          const ls = lineas(etiqueta(n))
          const x = px(n)
          const y = py(n)
          return (
            <g key={n.id} data-nodo={n.id}>
              <circle cx={x} cy={y} r={r}
                fill={n.tipo === 'sergio' ? 'var(--color-accent)' : n.tipo === 'modelo' ? 'var(--color-background)' : n.tipo === 'persona' ? 'var(--color-text-secondary)' : 'var(--color-border)'}
                stroke={n.tipo === 'modelo' ? 'var(--color-accent)' : esDominio ? 'var(--color-text-muted)' : 'none'} strokeWidth={1.5}>
                <title>{`${etiqueta(n)}: ${n.peso}`}</title>
              </circle>
              <text x={x + (esDominio ? r + 5 : -r - 5)} y={y + 4 - ((ls.length - 1) * (FUENTE + 1)) / 2}
                textAnchor={esDominio ? 'start' : 'end'} fontSize={FUENTE} fill="var(--color-text)">
                {ls.map((l, i) => <tspan key={i} x={x + (esDominio ? r + 5 : -r - 5)} dy={i === 0 ? 0 : FUENTE + 1}>{l}</tspan>)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function RedCoautoria({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.red')
  const tg = useTranslations('autorretrato')
  const etiqueta = (n: NodoGrafo) => n.tipo === 'dominio' ? tg(`dominios.${n.etiqueta}`) : n.tipo === 'sergio' ? t('sergio') : n.etiqueta
  const vieja = datos.eras.find(e => e.cuenta === 'smonsalve')
  const nueva = datos.eras.find(e => e.cuenta === 'serandmoncas')
  const personas = vieja?.coautores.find(c => c.tipo === 'persona')?.n ?? 0
  const modelos = nueva?.coautores.find(c => c.tipo === 'modelo')?.n ?? 0
  const leyenda: { k: string; fill: string; stroke: string }[] = [
    { k: 'sergio', fill: 'var(--color-accent)', stroke: 'none' },
    { k: 'persona', fill: 'var(--color-text-secondary)', stroke: 'none' },
    { k: 'modelo', fill: 'var(--color-background)', stroke: 'var(--color-accent)' },
    { k: 'dominio', fill: 'var(--color-border)', stroke: 'var(--color-text-muted)' },
  ]
  return (
    <Figura
      id="red-coautoria"
      titulo={t('titulo')}
      resumen={t('resumen', { personas, modelos })}
      etiquetaDatos={tg('verDatos')}
      tabla={{
        columnas: ['era', t('autor'), t('dominio'), t('commits')],
        filas: datos.grafoCoautoria.flatMap(g => {
          const porId = new Map(g.nodos.map(n => [n.id, n]))
          return g.aristas.flatMap(a => {
            const de = porId.get(a.de)
            const ha = porId.get(a.a)
            return de && ha ? [[g.era, etiqueta(de), etiqueta(ha), a.peso]] : []
          })
        }),
      }}
      pie={
        <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary list-none p-0">
          {leyenda.map(l => (
            <li key={l.k} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill={l.fill} stroke={l.stroke} strokeWidth="1.5" /></svg>
              {l.k === 'dominio' ? t('dominio') : t(`tipo.${l.k}`)}
            </li>
          ))}
        </ul>
      }
    >
      <div className="flex flex-wrap gap-4 justify-between">
        {datos.grafoCoautoria.map(g => (
          <Panel key={g.era} grafo={g} titulo={tituloEra(datos.eras.find(e => e.cuenta === g.era), g.era)} etiqueta={etiqueta} />
        ))}
      </div>
    </Figura>
  )
}
