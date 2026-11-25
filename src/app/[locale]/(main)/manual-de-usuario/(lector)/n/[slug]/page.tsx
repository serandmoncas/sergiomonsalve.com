import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { avisoManual } from '@/components/manual/EstadoManual'
import { ManualMarkdown } from '@/components/manual/ManualMarkdown'
import { CapaDesdeAqui } from '@/components/manual/CapaDesdeAqui'
import { NotaMeta } from '@/components/manual/NotaMeta'
import { BarraRecorrido } from '@/components/manual/BarraRecorrido'
import { CopiarEnlace } from '@/components/manual/CopiarEnlace'
import { getManualForReader } from '@/lib/manual/lector'
import { notaHref } from '@/lib/manual/paths'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ r?: string | string[] }>
}

const REPO_EDIT = 'https://github.com/serandmoncas/manual-de-usuario/edit/main/notas'

// El título solo sale para lectores: a los demás, uno genérico.
export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params
  const res = await getManualForReader()
  if (res.ok) {
    const nota = res.manual.notas.get(slug)
    if (nota) return { title: nota.titulo }
  }
  const t = await getTranslations('manual')
  return { title: t('nota.tituloGenerico') }
}

export default async function NotaPage({ params, searchParams }: Props) {
  const res = await getManualForReader()
  if (!res.ok) return avisoManual(res)

  const { slug } = await params
  const { manual, reader } = res
  const nota = manual.notas.get(slug)
  if (!nota) notFound()

  const r = (await searchParams).r
  const rSlug = typeof r === 'string' ? r : undefined
  const recorrido = rSlug ? manual.recorridos.get(rSlug) : undefined
  const t = await getTranslations('manual')
  const { resolve } = manual
  const rotulo = 'font-mono text-xs text-accent mb-2'

  return (
    <article className="max-w-[68ch] mx-auto px-6 py-12">
      {recorrido && <BarraRecorrido recorrido={recorrido} slug={slug} resolve={resolve} />}
      <h1 className="text-3xl font-extrabold text-text mb-6">{nota.titulo}</h1>
      {nota.entrada && <ManualMarkdown md={nota.entrada} resolve={resolve} recorrido={recorrido?.slug} />}

      {nota.capas.todos && (
        <section className="my-8">
          <p className={rotulo}>{t('nota.capaTodos')}</p>
          <ManualMarkdown md={nota.capas.todos} resolve={resolve} recorrido={recorrido?.slug} />
        </section>
      )}
      {nota.capas.otros && (
        <section className="my-8">
          <p className={rotulo}>{t('nota.capaOtros')}</p>
          <ManualMarkdown md={nota.capas.otros} resolve={resolve} recorrido={recorrido?.slug} />
        </section>
      )}
      {nota.capas.desdeAqui?.map((c, i) => (
        <CapaDesdeAqui key={i} voz={c.voz} md={c.md} resolve={resolve} recorrido={recorrido?.slug} />
      ))}

      {nota.llevar && (
        <section className="my-8 border-t border-border pt-6">
          <p className={rotulo}>{t('nota.llevar')}</p>
          <ManualMarkdown md={nota.llevar} resolve={resolve} recorrido={recorrido?.slug} />
        </section>
      )}

      <NotaMeta nota={nota} />

      {(manual.backlinks[slug] ?? []).length > 0 && (
        <section className="my-8">
          <p className={rotulo}>{t('nota.backlinks')}</p>
          <ul className="space-y-1 text-sm">
            {manual.backlinks[slug].map((b) => (
              <li key={b}>
                <Link href={notaHref(b)} className="hover:text-accent">{manual.notas.get(b)?.titulo ?? b}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-6 mt-8">
        <CopiarEnlace />
        {reader.isAdmin && (
          <a href={`${REPO_EDIT}/${slug}.md`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-text-muted hover:text-accent">
            {t('nota.editar')}
          </a>
        )}
      </div>
    </article>
  )
}
