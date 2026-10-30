import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { Especie } from '@/lib/aves/tipos'
import SiluetaPendiente from './SiluetaPendiente'

export default function TarjetaAve({ especie }: { especie: Especie }) {
  const t = useTranslations('aves')
  const nombre = useLocale() === 'en' ? especie.nombreEn : especie.nombreEs
  return (
    <Link
      href={`/aves/${especie.slug}`}
      className="group block border border-border rounded-sm overflow-hidden hover:border-accent transition-colors"
    >
      <div className="aspect-square">
        <SiluetaPendiente nombre={nombre} texto={t('ilustracionEnCamino')} />
      </div>
      <div className="p-3">
        <p className="font-mono text-[10px] text-text-muted mb-1">#{especie.puestoColombia}</p>
        <p className="text-sm font-semibold text-text group-hover:text-accent transition-colors">{nombre}</p>
        <p className="text-xs italic text-text-secondary">{especie.cientifico}</p>
      </div>
    </Link>
  )
}
