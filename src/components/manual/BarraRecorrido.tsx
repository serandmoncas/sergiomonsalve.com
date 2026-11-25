import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { notaHref, recorridoHref } from '@/lib/manual/paths'
import { pasoVecinos } from '@/lib/manual/recorridos'
import type { Recorrido, Resolver } from '@/lib/manual/types'

export function BarraRecorrido({ recorrido, slug, resolve }: { recorrido: Recorrido; slug: string; resolve: Resolver }) {
  const t = useTranslations('manual.recorrido')
  const pos = pasoVecinos(recorrido, slug, resolve)
  if (!pos) return null
  return (
    <div className="flex items-center gap-4 border border-border px-4 py-2 mb-8 font-mono text-xs">
      <Link href={recorridoHref(recorrido.slug)} className="text-accent">{recorrido.nombre}</Link>
      <span className="text-text-muted">{t('paso', { n: pos.indice + 1, total: pos.total })}</span>
      <span className="ml-auto flex gap-4">
        {pos.anterior && <Link href={notaHref(pos.anterior, recorrido.slug)} className="hover:text-accent">{t('anterior')}</Link>}
        {pos.siguiente && <Link href={notaHref(pos.siguiente, recorrido.slug)} className="hover:text-accent">{t('siguiente')}</Link>}
      </span>
    </div>
  )
}
