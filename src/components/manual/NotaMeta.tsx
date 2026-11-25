import { useTranslations } from 'next-intl'
import type { Nota } from '@/lib/manual/types'

const CAPAS: ('todos' | 'otros' | 'desde_aqui')[] = ['todos', 'otros', 'desde_aqui']

// Estado, confianza, lo que hizo la IA en cada capa y las fuentes.
export function NotaMeta({ nota }: { nota: Nota }) {
  const t = useTranslations('manual.nota')
  const ia = CAPAS.filter((c) => nota.iaCapas[c])
  return (
    <div className="font-mono text-xs text-text-muted space-y-2 my-6">
      <p>
        {t('estado')}: <span className="text-text">{nota.estado}</span> · {t('confianza')}: <span className="text-text">{nota.confianza}</span>
      </p>
      {ia.length > 0 && (
        <ul className="space-y-1">
          {ia.map((c) => (
            <li key={c}>
              {t(`ia.${c}`)}: <span className="text-text">{nota.iaCapas[c]}</span>
            </li>
          ))}
        </ul>
      )}
      {nota.fuentes.length > 0 && (
        <details>
          <summary className="cursor-pointer">{t('fuentes')}</summary>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {nota.fuentes.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
