import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

// El viewBox mide ANCHO + 28 = 388: a 328 px de ancho la escala es 0,85, así que 13 unidades ≈ 11 px.
const ANCHO = 360
const BASE = 170
const TEXTO = 13
const ALTO = BASE + 62

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)

export function modeloPrincipal(datos: AutorretratoIA, mes: string): string {
  return datos.modelosPorMes.filter(m => m.mes === mes).sort((a, b) => b.commits - a.commits)[0]?.modelo ?? '—'
}

type Mes = AutorretratoIA['commitsPorMes'][number]

/** Rellena con barras de cero commits los meses sin actividad entre el primero y el último. */
export function completarMeses(meses: Mes[]): Mes[] {
  if (meses.length < 2) return meses
  const porMes = new Map(meses.map(m => [m.mes, m]))
  const ordenados = [...porMes.keys()].sort()
  let [a, m] = ordenados[0].split('-').map(Number)
  const fin = ordenados[ordenados.length - 1]
  const salida: Mes[] = []
  for (;;) {
    const clave = `${a}-${String(m).padStart(2, '0')}`
    salida.push(porMes.get(clave) ?? { mes: clave, total: 0, coautoriaClaude: 0, porTipo: {} })
    if (clave >= fin) break
    if (++m > 12) { m = 1; a++ }
  }
  return salida
}

export default function CoautoriaMensual({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.coautoria')
  const tg = useTranslations('autorretrato')
  const meses = completarMeses(datos.commitsPorMes)
  const max = meses.reduce((m, x) => Math.max(m, x.total), 0)
  const paso = ANCHO / Math.max(meses.length, 1)
  const ultimo = meses.at(-1)
  const angosto = paso < 64 // con muchos meses: mes corto y modelo en dos filas alternas
  return (
    <Figura
      id="coautoria-mensual"
      titulo={t('titulo')}
      resumen={t('resumen', { mes: ultimo?.mes ?? '—', pct: ultimo ? pct(ultimo.coautoriaClaude, ultimo.total) : 0 })}
      etiquetaDatos={tg('verDatos')}
      pie={
      <p className="font-mono text-xs text-text-secondary mt-2">
        <span className="inline-block w-2 h-2 mr-1 bg-accent" />{t('conClaude')}
        <span className="inline-block w-2 h-2 ml-4 mr-1 bg-text-muted" />{t('soloHumano')}
      </p>
      }
      tabla={{
        columnas: [t('mes'), t('total'), t('conClaude'), t('modelo')],
        filas: meses.map(m => [m.mes, m.total, `${m.coautoriaClaude} (${pct(m.coautoriaClaude, m.total)}%)`, modeloPrincipal(datos, m.mes)]),
      }}
    >
      <svg viewBox={`-14 0 ${ANCHO + 28} ${ALTO}`} width="100%" aria-hidden="true">
        {meses.map((m, i) => {
          const altoTotal = max ? ((BASE - 30) * m.total) / max : 0
          const altoClaude = m.total ? (altoTotal * m.coautoriaClaude) / m.total : 0
          const x = i * paso + paso * 0.2
          const w = paso * 0.6
          return (
            <g key={m.mes} data-mes={m.mes}>
              <rect x={x} y={BASE - altoTotal} width={w} height={altoTotal - altoClaude} fill="var(--color-text-muted)" />
              <rect x={x} y={BASE - altoClaude} width={w} height={altoClaude} fill="var(--color-accent)" />
              <text x={x + w / 2} y={BASE - altoTotal - 6} textAnchor="middle" fontSize={TEXTO} fill="var(--color-text)">{`${pct(m.coautoriaClaude, m.total)}%`}</text>
              <text x={x + w / 2} y={BASE + 16} textAnchor="middle" fontSize={TEXTO} fill="var(--color-text-secondary)">{angosto ? m.mes.slice(5) : m.mes}</text>
              <text x={x + w / 2} y={BASE + 34 + (angosto ? (i % 2) * 16 : 0)} textAnchor="middle" fontSize={TEXTO} fill="var(--color-text-secondary)">{modeloPrincipal(datos, m.mes).replace(/^Claude /, '')}</text>
            </g>
          )
        })}
      </svg>
    </Figura>
  )
}
