import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { avisoManual } from '@/components/manual/EstadoManual'
import { Grafo } from '@/components/manual/Grafo'
import { getManualForReader } from '@/lib/manual/lector'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('manual')
  return { title: t('grafo.titulo') }
}

export default async function GrafoPage() {
  // La guarda va en la propia página: no depende solo del layout.
  const res = await getManualForReader()
  if (!res.ok) return avisoManual(res)
  const t = await getTranslations('manual')
  // Solo ids, títulos y enlaces cruzan al cliente; nunca el cuerpo de las notas.
  const { nodes, links } = res.manual.grafo

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold text-text mb-6">{t('grafo.titulo')}</h1>
      {nodes.length === 0 ? (
        <p className="text-sm text-text-muted">{t('grafo.vacio')}</p>
      ) : (
        <Grafo grafo={{ nodes, links }} />
      )}
    </div>
  )
}
