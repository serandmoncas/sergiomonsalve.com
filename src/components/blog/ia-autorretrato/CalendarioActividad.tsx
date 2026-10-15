import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

// Con ~48 semanas el viewBox mide ~670 y a 328 px la escala es ~0,49: celdas de ~5,4 px; el texto se agranda para seguir ≥ 11 px.
export const CELDA = 11
export const PASO = 14
const SEMANAS_MIN = 26 // un rango corto no debe inflar celdas ni texto
const ALTO_BARRAS = 40
const ANCHO_REFERENCIA = 328 // contenedor a 360 px de pantalla
const TEXTO_MIN_PX = 11

type Dia = { fecha: string; prompts: number }
export type Celda = Dia & { col: number; fila: number }

/** Todos los días entre el primero y el último, con columna = semana y fila = día (lunes = 0). */
export function ubicarEnSemanas(dias: Dia[]): Celda[] {
  if (dias.length === 0) return []
  const ordenados = [...dias].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const porFecha = new Map(ordenados.map(d => [d.fecha, d.prompts]))
  const inicio = new Date(`${ordenados[0].fecha}T00:00:00Z`)
  const fin = new Date(`${ordenados.at(-1)!.fecha}T00:00:00Z`)
  const desfase = (inicio.getUTCDay() + 6) % 7
  const celdas: Celda[] = []
  for (let d = new Date(inicio), i = 0; d <= fin; d.setUTCDate(d.getUTCDate() + 1), i++) {
    const fecha = d.toISOString().slice(0, 10)
    celdas.push({ fecha, prompts: porFecha.get(fecha) ?? 0, col: Math.floor((i + desfase) / 7), fila: (d.getUTCDay() + 6) % 7 })
  }
  return celdas
}

/** 0 = sin actividad; 1–4 = cuartos del máximo. */
export function nivel(valor: number, max: number): number {
  if (valor <= 0 || max <= 0) return 0
  return Math.min(4, Math.max(1, Math.ceil((valor / max) * 4)))
}

export default function CalendarioActividad({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.calendario')
  const tg = useTranslations('autorretrato')
  const celdas = ubicarEnSemanas(datos.actividadDiaria)
  const max = celdas.reduce((m, c) => Math.max(m, c.prompts), 0)
  const columnas = celdas.reduce((m, c) => Math.max(m, c.col + 1), 1)
  const ancho = Math.max(columnas, SEMANAS_MIN) * PASO
  const altoCalendario = 7 * PASO
  // Unidades de texto para que se vea a >= 11 px cuando el SVG mide 328 px.
  const texto = Math.max(12, Math.ceil((TEXTO_MIN_PX * ancho) / ANCHO_REFERENCIA))
  const baseBarras = altoCalendario + 8 + texto + 4 + ALTO_BARRAS
  const alto = baseBarras + texto + 6

  // Commits por mes: una barra bajo la primera semana de cada mes.
  const colDeMes = new Map<string, number>()
  for (const c of celdas) if (!colDeMes.has(c.fecha.slice(0, 7))) colDeMes.set(c.fecha.slice(0, 7), c.col)
  const meses = datos.commitsPorMes.filter(m => colDeMes.has(m.mes))
  const maxCommits = meses.reduce((m, x) => Math.max(m, x.total), 0)

  return (
    <Figura
      id="calendario-actividad"
      titulo={t('titulo')}
      resumen={t('resumen', { dias: celdas.filter(c => c.prompts > 0).length, max })}
      etiquetaDatos={tg('verDatos')}
      tabla={{ columnas: [t('fecha'), t('prompts'), t('sesiones')], filas: datos.actividadDiaria.map(d => [d.fecha, d.prompts, d.sesiones]) }}
      tablaExtra={{ columnas: [t('mes'), t('commitsMes')], filas: datos.commitsPorMes.map(m => [m.mes, m.total]) }}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} width="100%" aria-hidden="true">
        {celdas.map(c => (
          <rect key={c.fecha} x={c.col * PASO} y={c.fila * PASO} width={CELDA} height={CELDA} rx={2}
            fill={c.prompts ? 'var(--color-accent)' : 'var(--color-border)'}
            fillOpacity={c.prompts ? 0.2 + 0.2 * nivel(c.prompts, max) : 1}>
            <title>{`${c.fecha}: ${c.prompts}`}</title>
          </rect>
        ))}
        {meses.map(m => {
          const col = colDeMes.get(m.mes)!
          const altoBarra = maxCommits ? (m.total / maxCommits) * ALTO_BARRAS : 0
          const x = col * PASO
          const alFinal = col >= columnas - 3 // el texto se ancla a la derecha para no salirse
          const ax = alFinal ? x + CELDA : x
          return (
            <g key={m.mes}>
              <title>{`${m.mes}: ${m.total} ${t('commits')}`}</title>
              <rect x={x} y={baseBarras - altoBarra} width={CELDA} height={altoBarra} fill="var(--color-text-secondary)" />
              <text x={ax} y={baseBarras - altoBarra - 4} textAnchor={alFinal ? 'end' : 'start'} fontSize={texto} fill="var(--color-text)">{m.total}</text>
              <text x={ax} y={baseBarras + texto + 2} textAnchor={alFinal ? 'end' : 'start'} fontSize={texto} fill="var(--color-text-secondary)">{m.mes.slice(5)}</text>
            </g>
          )
        })}
      </svg>
    </Figura>
  )
}
