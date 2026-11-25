import { useTranslations } from 'next-intl'
import { ManualMarkdown } from './ManualMarkdown'
import type { Resolver } from '@/lib/manual/types'

// Bloque "desde aquí": cerrado por defecto; OcultarSergio puede esconderlo.
export function CapaDesdeAqui({ voz, md, resolve, recorrido }: { voz: string; md: string; resolve: Resolver; recorrido?: string }) {
  const t = useTranslations('manual.nota')
  return (
    <details data-desde-aqui className="my-4 border-l-2 border-accent pl-4">
      <summary className="cursor-pointer font-mono text-xs text-accent">{t('desdeAqui', { voz })}</summary>
      <div className="mt-3">
        <ManualMarkdown md={md} resolve={resolve} recorrido={recorrido} />
      </div>
    </details>
  )
}
