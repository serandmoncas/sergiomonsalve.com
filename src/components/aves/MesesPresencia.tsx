import { useTranslations } from 'next-intl'

// Registros por mes en Colombia (enero primero): muestra en qué época se ve más
export default function MesesPresencia({ meses }: { meses: number[] }) {
  const t = useTranslations('aves')
  const maximo = Math.max(...meses, 1)
  return (
    <div className="flex items-end gap-1 h-20">
      {meses.map((n, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div
            aria-label={`${t(`meses.${i}`)}: ${n}`}
            data-maximo={n === maximo}
            className={`w-full rounded-sm ${n === maximo ? 'bg-accent' : 'bg-border'}`}
            style={{ height: `${Math.max((n / maximo) * 100, 4)}%` }}
          />
          <span className="font-mono text-[9px] text-text-muted">{t(`meses.${i}`).slice(0, 1)}</span>
        </div>
      ))}
    </div>
  )
}
