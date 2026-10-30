import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import type { Especie, Variante } from '@/lib/aves/tipos'
import SiluetaPendiente from './SiluetaPendiente'

// Ilustración aprobada de la especie (la primera, o la variante pedida); si no hay, la silueta.
// Las WebP ya salen redimensionadas de la ingesta, por eso no pasan por el optimizador de imágenes.
export default function IlustracionAve({
  especie,
  tamano,
  variante,
}: {
  especie: Especie
  tamano: 512 | 1024
  variante?: Variante
}) {
  const t = useTranslations('aves')
  const nombre = useLocale() === 'en' ? especie.nombreEn : especie.nombreEs
  const ilustracion = variante
    ? especie.ilustraciones.find(i => i.variante === variante)
    : especie.ilustraciones[0]

  if (!ilustracion) return <SiluetaPendiente nombre={nombre} texto={t('ilustracionEnCamino')} />

  return (
    <div className="relative w-full h-full bg-white">
      <Image
        src={`/aves/${ilustracion.archivo}-${tamano}.webp`}
        alt={`${nombre} — ${t(`variante.${ilustracion.variante}`)}`}
        fill
        unoptimized
        sizes={tamano === 512 ? '(max-width: 640px) 50vw, 20vw' : '(max-width: 768px) 100vw, 50vw'}
        className="object-contain p-2"
      />
    </div>
  )
}
