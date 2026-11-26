import Link from 'next/link'
import type { VistaHoy as Vista } from '@/lib/diaria'
import { urlNota } from '@/lib/diario/urls'

type Item = { clave: string; texto: string; apariciones: { dia: string; ruta: string }[] }

function Seccion({ titulo, items, locale, detalle }: {
  titulo: string
  items: readonly Item[]
  locale: string
  detalle?: (i: Item) => string
}) {
  const id = `seccion-${titulo.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <section aria-labelledby={id} className="mb-8">
      <h2 id={id} className="font-mono text-xs text-accent uppercase tracking-widest mb-3">{titulo}</h2>
      {items.length === 0 ? (
        <p className="text-text-secondary">Nada.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map(i => {
            const ultima = i.apariciones.at(-1)
            return (
              <li key={i.clave} className="text-base leading-snug">
                {ultima ? (
                  <Link href={urlNota(locale, ultima.ruta)} className="text-text hover:text-accent">{i.texto}</Link>
                ) : (
                  <span className="text-text">{i.texto}</span>
                )}
                {detalle && <span className="block font-mono text-xs text-text-secondary">{detalle(i)}</span>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

const diasYNotas = (i: Item & { dias?: number; notas?: number }) =>
  `${i.notas ?? 0} notas · ${i.dias ?? 0} días`

/** Las listas de Hoy, de solo lectura (DI-084). */
export default function VistaHoy({ vista, locale }: { vista: Vista; locale: string }) {
  return (
    <div>
      <Seccion titulo="Para hoy" items={vista.hoy} locale={locale} />
      <Seccion titulo="Arrastrados" items={vista.arrastrados} locale={locale} detalle={diasYNotas} />
      <Seccion titulo="Quedaron atrás" items={vista.atras} locale={locale} detalle={diasYNotas} />
      <Seccion titulo="Rutinas" items={vista.rutinas} locale={locale} />
      <Seccion
        titulo="Luego"
        items={vista.rutinasLuego}
        locale={locale}
        detalle={i => ('proxima' in i ? `desde ${String(i.proxima)}` : '')}
      />
    </div>
  )
}
