import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { avisoManual } from '@/components/manual/EstadoManual'
import { getManualForReader } from '@/lib/manual/lector'
import { notaHref, recorridoHref } from '@/lib/manual/paths'

type Props = { params: Promise<{ recorrido: string }> }

export default async function RecorridoPage({ params }: Props) {
  const res = await getManualForReader()
  if (!res.ok) return avisoManual(res)

  const { recorrido: slug } = await params
  const { manual } = res
  const rec = manual.recorridos.get(slug)
  if (!rec) notFound()

  const t = await getTranslations('manual')

  return (
    <div className="max-w-[68ch] mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold text-text mb-6">{rec.nombre}</h1>
      {rec.paraQuien && (
        <p className="mb-2 text-sm"><span className="font-mono text-xs text-accent">{t('recorrido.paraQuien')}: </span>{rec.paraQuien}</p>
      )}
      {rec.resultado && (
        <p className="mb-8 text-sm"><span className="font-mono text-xs text-accent">{t('recorrido.resultado')}: </span>{rec.resultado}</p>
      )}
      <ol className="space-y-3">
        {rec.pasos.map((p, i) => {
          const r = manual.resolve(p)
          const nota = r?.tipo === 'nota' ? manual.notas.get(r.slug) : undefined
          const href = r?.tipo === 'nota' && nota ? notaHref(r.slug, rec.slug) : r?.tipo === 'recorrido' ? recorridoHref(r.slug) : null
          const texto = nota?.titulo ?? p
          return (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-xs text-text-muted pt-1">{i + 1}.</span>
              {href ? (
                <Link href={href} className="hover:text-accent">{texto}</Link>
              ) : (
                <span data-por-escribir className="text-text-muted italic">
                  {texto} <span className="font-mono text-xs">({t('recorrido.porEscribir')})</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
