import { useTranslations } from 'next-intl'
import type { Region } from '@/lib/aves/tipos'

// Mapa esquemático (no a escala) de las 6 regiones naturales de Colombia
const FORMAS: Record<Region, string> = {
  caribe: 'M70 20 L150 10 L165 45 L120 70 L80 65 L60 45 Z',
  insular: 'M18 22 L28 18 L32 28 L22 32 Z',
  pacifica: 'M40 75 L65 70 L70 120 L60 175 L35 190 L30 130 Z',
  andina: 'M65 70 L120 70 L135 100 L115 150 L85 200 L60 175 L70 120 Z',
  orinoquia: 'M120 70 L165 45 L195 80 L190 125 L135 130 L135 100 Z',
  amazonia: 'M115 150 L135 130 L190 125 L185 200 L150 250 L100 235 L85 200 Z',
}

export default function MapaRegiones({ regiones }: { regiones: Region[] }) {
  const t = useTranslations('aves')
  const presentes = new Set(regiones)
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 200 260" className="w-32 shrink-0" role="img" aria-label={t('mapaAlt')}>
        {(Object.keys(FORMAS) as Region[]).map(r => (
          <path
            key={r}
            d={FORMAS[r]}
            data-region={r}
            data-presente={presentes.has(r)}
            className={presentes.has(r) ? 'fill-accent stroke-background' : 'fill-surface stroke-border'}
            strokeWidth={2}
          />
        ))}
      </svg>
      <ul className="text-sm text-text-secondary space-y-1">
        {(Object.keys(FORMAS) as Region[]).map(r => (
          <li key={r} className={presentes.has(r) ? 'text-text' : 'text-text-muted line-through'}>
            {t(`region.${r}`)}
          </li>
        ))}
      </ul>
    </div>
  )
}
