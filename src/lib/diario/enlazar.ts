import { extraerEnlaces, type Enlace, type Resolutor } from '@/lib/diaria'
import { urlNota } from './urls'

/** Escapa lo que Markdown interpretaría dentro del texto de un enlace. */
const escapar = (t: string) => t.replace(/[\\[\]()*_`<>!~]/g, c => `\\${c}`)

const visible = (e: Enlace) => e.alias ?? (e.seccion ? `${e.destino}#${e.seccion}` : e.destino)

/** URL de nota en la forma <…> de Markdown; los paréntesis van codificados. */
const destinoMd = (locale: string, ruta: string) =>
  `<${urlNota(locale, ruta).replace(/\(/g, '%28').replace(/\)/g, '%29')}>`

/**
 * Convierte los `[[enlaces]]` de una nota en enlaces Markdown hacia la web
 * (DI-084), con la misma resolución de DiarIA. Los rotos o ambiguos van a
 * `#roto`; los incrustados se muestran como texto. Lo que está en código no se
 * toca, porque `extraerEnlaces` ya lo ignora.
 */
export function enlazar(texto: string, desde: string, resolutor: Resolutor, locale: string): string {
  let salida = texto
  for (const e of extraerEnlaces(texto).reverse()) {
    let reemplazo: string
    if (e.incrustado) reemplazo = `\`adjunto: ${e.destino.replace(/`/g, '')}\``
    else {
      const r = resolutor.resolver(e, desde)
      const destino = r.tipo === 'nota' ? destinoMd(locale, r.ruta) : '#roto'
      reemplazo = `[${escapar(visible(e))}](${destino})`
    }
    salida = salida.slice(0, e.inicio) + reemplazo + salida.slice(e.fin)
  }
  return salida
}
