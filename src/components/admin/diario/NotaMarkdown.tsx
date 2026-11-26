import Link from 'next/link'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

const componentes: Components = {
  a({ href, children }) {
    if (href === '#roto')
      return <span className="roto text-text-muted line-through decoration-dotted" title="Nota que no existe">{children}</span>
    if (href?.startsWith('/')) return <Link href={href} className="text-accent hover:underline">{children}</Link>
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{children}</a>
    )
  },
}

/**
 * Una nota del diario pintada como Markdown (DI-084). Sin HTML crudo
 * (`skipHtml`): el texto de una nota nunca puede inyectar elementos. Las
 * casillas de remark-gfm salen deshabilitadas.
 */
export default function NotaMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="mdx-prose">
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={componentes}>
        {markdown}
      </Markdown>
    </div>
  )
}
