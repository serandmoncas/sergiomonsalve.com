import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

// viewBox de 360: a 328 px de ancho la escala es 0.91, así que 13 unidades ≈ 11,8 px.
const ANCHO = 360
const FILA = 26
const ETIQUETA = 135
const RESERVA_VALOR = 70
const TEXTO = 13
const MAX_NOMBRE = 16

/** Nombre de pantalla: las herramientas MCP se acortan ('mcp:plugin_vercel_vercel' → 'Vercel'); el nombre completo queda en <title> y tabla. */
export function nombreCorto(n: string): string {
  if (!n.startsWith('mcp:')) return n
  const x = n.slice(4)
  const conocidas: [RegExp, string][] = [[/playwright/i, 'Playwright'], [/chrome/i, 'Chrome'], [/vercel/i, 'Vercel'], [/railway/i, 'Railway']]
  for (const [re, nombre] of conocidas) if (re.test(x)) return nombre
  return x.replace(/^plugin_/, '').replace(/^claude_ai_/, '')
}

const corto = (n: string) => (n.length > MAX_NOMBRE ? `${n.slice(0, MAX_NOMBRE - 1)}…` : n)

export default function BarrasHerramientas({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.herramientas')
  const tg = useTranslations('autorretrato')
  const hs = datos.herramientas.slice(0, 10)
  const max = hs.reduce((m, h) => Math.max(m, h.usos), 0)
  const top = hs[0]
  return (
    <Figura
      id="barras-herramientas"
      titulo={t('titulo')}
      resumen={t('resumen', { top: top?.nombre ?? '—', usos: top?.usos ?? 0 })}
      etiquetaDatos={tg('verDatos')}
      tabla={{ columnas: [t('herramienta'), t('usos'), t('grupo')], filas: datos.herramientas.map(h => [h.nombre, h.usos, t(`grupos.${h.grupo}`)]) }}
    >
      <svg viewBox={`0 0 ${ANCHO} ${Math.max(hs.length, 1) * FILA}`} width="100%" aria-hidden="true">
        {hs.map((h, i) => {
          const largo = max ? ((ANCHO - ETIQUETA - RESERVA_VALOR) * h.usos) / max : 0
          return (
            <g key={h.nombre} data-herramienta={h.nombre} transform={`translate(0 ${i * FILA})`}>
              <title>{`${h.nombre}: ${h.usos} · ${t(`grupos.${h.grupo}`)}`}</title>
              <text x={ETIQUETA - 8} y={17} textAnchor="end" fontSize={TEXTO} fill="var(--color-text)">{corto(nombreCorto(h.nombre))}</text>
              <rect x={ETIQUETA} y={5} width={largo} height={14} rx={2} fill="var(--color-accent)" fillOpacity={0.85} />
              <text x={ETIQUETA + largo + 6} y={17} fontSize={TEXTO} fill="var(--color-text-secondary)">{h.usos}</text>
            </g>
          )
        })}
      </svg>
    </Figura>
  )
}
