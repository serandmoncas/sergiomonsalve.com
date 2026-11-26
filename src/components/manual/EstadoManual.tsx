import { getTranslations } from 'next-intl/server'
import type { ManualForReader } from '@/lib/manual/lector'

type Fallo = Exclude<ManualForReader, { ok: true }>

function Aviso({ texto }: { texto: string }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      <p className="text-sm text-text-muted">{texto}</p>
    </div>
  )
}

// Mensaje para el caso en que no hay acceso o el manual no se pudo traer.
// Compartido por el layout del lector y cada página. Es una función async
// (no un componente) para poder invocarla con await desde páginas y tests.
export async function avisoManual(res: Fallo) {
  const t = await getTranslations('manual')
  if (res.motivo === 'sin-acceso') return <Aviso texto={t('sinAcceso')} />
  if (res.error.tipo === 'no-configurado') return <Aviso texto={t('noDisponible')} />
  // El detalle nunca se muestra al lector.
  console.error(`[manual] fallo en la guarda: ${res.error.detalle}`)
  return <Aviso texto={t('fallo')} />
}
