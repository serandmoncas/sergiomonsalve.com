import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from '@/i18n/navigation'
import { notaHref, recorridoHref } from '@/lib/manual/paths'
import { wikiTarget } from '@/lib/manual/parse'
import type { Resolver } from '@/lib/manual/types'

const WIKILINK = /\[\[([^\]\n]+)\]\]/g
const VERIFICAR = /\[VERIFICAR[:\s]*([^\]\n]*)\]/g

// Esquemas internos: el md se reescribe a links con estos esquemas y el
// componente `a` los interpreta. Nunca se usa HTML crudo (sin rehype-raw).
const ESQ_MANUAL = 'manual:'
const ESQ_VERIFICAR = 'verificar:'

const sinCorchetes = (s: string) => s.replace(/[[\]]/g, '')

// encodeURIComponent deja pasar ( ) ! ' *, que romperían el destino del link.
const codificar = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)

// Un destino escrito a mano puede traer % inválidos: en ese caso queda crudo.
function decodificar(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

const marcaVerificar = (detalle: string) => `[por verificar](${ESQ_VERIFICAR}${codificar(detalle.trim())})`

// Código en bloque o en línea: no se reescribe. Excepción: un código en línea
// que es solo una marca `[VERIFICAR…]` pasa a ser la marca.
const CODIGO = /(^(?:```|~~~)[\s\S]*?(?:\n(?:```|~~~)[^\n]*(?=\n|$)|(?![\s\S])))|(`+)([^`\n]+?)\2(?!`)/gm
const SOLO_VERIFICAR = /^\[VERIFICAR[:\s]*([^\]\n]*)\]$/

function reescribirTexto(md: string): string {
  return md
    .replace(WIKILINK, (_m, raw: string) => {
      const destino = wikiTarget(raw)
      const alias = raw.includes('|') ? raw.slice(raw.indexOf('|') + 1).trim() : destino
      return `[${sinCorchetes(alias || destino)}](${ESQ_MANUAL}${codificar(destino)})`
    })
    .replace(VERIFICAR, (_m, detalle: string) => marcaVerificar(detalle))
}

/** `[[x|alias]]` y `[VERIFICAR: x]` pasan a links con esquema interno, fuera del código. */
function preprocesar(md: string): string {
  let salida = ''
  let ultimo = 0
  for (const m of md.matchAll(CODIGO)) {
    const i = m.index ?? 0
    salida += reescribirTexto(md.slice(ultimo, i))
    const marca = m[3] !== undefined ? SOLO_VERIFICAR.exec(m[3].trim()) : null
    salida += marca ? marcaVerificar(marca[1]) : m[0]
    ultimo = i + m[0].length
  }
  return salida + reescribirTexto(md.slice(ultimo))
}

// Deja pasar solo nuestros esquemas; el resto sigue la sanitización por defecto.
const urlTransform = (url: string) =>
  url.startsWith(ESQ_MANUAL) || url.startsWith(ESQ_VERIFICAR) ? url : defaultUrlTransform(url)

export function ManualMarkdown({
  md,
  resolve,
  recorrido,
}: {
  md: string
  resolve: Resolver
  /** Slug del recorrido en curso: los links a notas conservan `?r=`. */
  recorrido?: string
}) {
  return (
    <div className="mdx-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={urlTransform}
        components={{
          a({ href, children }) {
            if (href?.startsWith(ESQ_VERIFICAR)) {
              return (
                <mark data-verificar title={decodificar(href.slice(ESQ_VERIFICAR.length))}>
                  {children}
                </mark>
              )
            }
            if (href?.startsWith(ESQ_MANUAL)) {
              const r = resolve(decodificar(href.slice(ESQ_MANUAL.length)))
              if (!r) return <span data-por-escribir className="text-text-muted italic">{children}</span>
              const destino = r.tipo === 'nota' ? notaHref(r.slug, recorrido) : recorridoHref(r.slug)
              return <Link href={destino}>{children}</Link>
            }
            return <a href={href}>{children}</a>
          },
        }}
      >
        {preprocesar(md)}
      </ReactMarkdown>
    </div>
  )
}
