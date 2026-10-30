import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getEspecie, getFechaConsulta, getSlugs } from '@/lib/aves/catalogo'
import SiluetaPendiente from '@/components/aves/SiluetaPendiente'
import ComparadorTamano from '@/components/aves/ComparadorTamano'
import MapaRegiones from '@/components/aves/MapaRegiones'
import MesesPresencia from '@/components/aves/MesesPresencia'
import YoLoVi from '@/components/aves/YoLoVi'
import AtribucionDatos from '@/components/aves/AtribucionDatos'

export function generateStaticParams() {
  return getSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const especie = getEspecie(slug)
  if (!especie) return {}
  const t = await getTranslations({ locale, namespace: 'meta' })
  const nombre = locale === 'en' ? especie.nombreEn : especie.nombreEs
  return {
    title: `${nombre} (${especie.cientifico}) — ${t('avesTitle')}`,
    description: `${especie.nombreEs} · ${especie.nombreEn} · ${especie.cientifico} · ${especie.familia}`,
    alternates: {
      canonical: `/${locale}/aves/${slug}`,
      languages: { es: `/es/aves/${slug}`, en: `/en/aves/${slug}` }
    }
  }
}

const claseSeccion = 'border-t border-border pt-6 mt-8'
const claseTituloSeccion = 'font-mono text-xs text-text-muted uppercase tracking-widest mb-4'
const claseInsignia = 'font-mono text-xs border border-border bg-surface px-3 py-1 rounded-full'

export default async function FichaAvePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const especie = getEspecie(slug)
  if (!especie) notFound()

  const t = await getTranslations({ locale, namespace: 'aves' })
  const a = especie.atributos
  const nombrePrincipal = locale === 'en' ? especie.nombreEn : especie.nombreEs
  const nombreSecundario = locale === 'en' ? especie.nombreEs : especie.nombreEn

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/aves" className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-10 block">
        ← {t('volver')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8 items-start">
        <div className="aspect-square border border-border rounded-sm overflow-hidden">
          <SiluetaPendiente nombre={especie.nombreEs} texto={t('ilustracionEnCamino')} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text mb-2">{nombrePrincipal}</h1>
          <p className="text-lg italic text-text-secondary mb-1">{especie.cientifico}</p>
          <p className="text-sm text-text-secondary mb-4">{nombreSecundario}</p>
          <p className="font-mono text-xs text-text-muted mb-6">
            {t('familiaLabel')}: {especie.familia} · {especie.orden}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`${claseInsignia} text-accent`}>{t('puestoColombia', { n: especie.puestoColombia })}</span>
            <span className={claseInsignia}>
              {especie.puestoLatam ? t('puestoLatam', { n: especie.puestoLatam }) : t('fueraTop')}
            </span>
            {a?.endemica && <span className={`${claseInsignia} text-accent`}>{t('endemica')}</span>}
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <YoLoVi speciesKey={especie.speciesKey} />
            <a
              href={`https://xeno-canto.org/explore?query=${especie.cientifico.replace(/ /g, '+')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-text-secondary hover:text-accent transition-colors"
            >
              {t('escucharCanto')}
            </a>
          </div>
        </div>
      </div>

      {a && (
        <section className={claseSeccion}>
          <h2 className={claseTituloSeccion}>{t('seccionIdentificacion')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ComparadorTamano tamanoCm={a.tamanoCm} />
            <div className="text-sm text-text-secondary space-y-2">
              <p>{t('altitud', { min: a.altitudM[0], max: a.altitudM[1] })}</p>
              <p>{t(`residencia.${a.residencia}`)}</p>
              <p>{a.habitats.map(h => t(`habitat.${h}`)).join(' · ')}</p>
            </div>
          </div>
        </section>
      )}

      <section className={claseSeccion}>
        <h2 className={claseTituloSeccion}>{t('seccionDistribucion')}</h2>
        <MapaRegiones regiones={especie.regiones} />
      </section>

      <section className={claseSeccion}>
        <h2 className={claseTituloSeccion}>{t('seccionTemporada')}</h2>
        <MesesPresencia meses={especie.meses} />
      </section>

      <section className={claseSeccion}>
        <h2 className={claseTituloSeccion}>{t('seccionConservacion')}</h2>
        <p className="text-sm text-text-secondary">
          {especie.amenaza ? t(`amenaza.${especie.amenaza}`) : t('sinAmenaza')}
        </p>
      </section>

      <AtribucionDatos fecha={getFechaConsulta()} />
    </div>
  )
}
