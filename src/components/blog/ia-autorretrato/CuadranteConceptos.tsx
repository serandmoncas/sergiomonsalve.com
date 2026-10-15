import { useTranslations } from 'next-intl'
import { DATOS } from '@/lib/ia-autorretrato/datos'
import type { AutorretratoIA, Cuadrante } from '@/lib/ia-autorretrato/tipos'
import Figura from './Figura'

// Fila de arriba: construido; columna derecha: hablado.
const ORDEN: Cuadrante[] = ['solo-construido', 'ambos', 'ninguno', 'solo-hablado']

export default function CuadranteConceptos({ datos = DATOS }: { datos?: AutorretratoIA }) {
  const t = useTranslations('autorretrato.conceptos')
  const tg = useTranslations('autorretrato')
  const cuenta = (q: Cuadrante) => datos.conceptos.filter(c => c.cuadrante === q).length
  return (
    <Figura
      id="cuadrante-conceptos"
      titulo={t('titulo')}
      resumen={t('resumen', { ambos: cuenta('ambos'), ninguno: cuenta('ninguno') })}
      etiquetaDatos={tg('verDatos')}
      tabla={{
        columnas: [t('termino'), t('categoria'), t('hablado'), t('preguntado'), t('construido'), t('cuadrante')],
        filas: datos.conceptos.map(c => [c.termino, c.categoria, c.hablado, c.preguntado, c.construido ? t('si') : t('no'), t(`cuadrantes.${c.cuadrante}`)]),
      }}
      pie={<p className="font-mono text-xs text-text-secondary mt-2">{t('leyendaPreguntado')}</p>}
    >
      <div className="grid grid-cols-2 gap-px bg-border border border-border">
        {ORDEN.map(q => (
          <div key={q} data-cuadrante={q} className="bg-background p-3 min-h-28">
            <p className="font-mono text-xs text-text-secondary mb-2">{`${t(`cuadrantes.${q}`)} · ${cuenta(q)}`}</p>
            <div className="flex flex-wrap gap-1.5">
              {datos.conceptos.filter(c => c.cuadrante === q).map(c => (
                <span
                  key={c.slug}
                  data-concepto={c.slug}
                  data-preguntado={String(c.preguntado > 0)}
                  title={c.termino}
                  className={`inline-block w-2.5 h-2.5 rounded-full ${q === 'ninguno' ? 'bg-text-muted' : 'bg-accent'} ${c.preguntado > 0 ? 'ring-2 ring-offset-1 ring-offset-background ring-text-secondary' : ''}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Figura>
  )
}
