import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

function Step({ number, children }: { number?: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-4 not-italic">
      {number != null && (
        <span className="font-mono text-xs text-accent shrink-0 pt-1">{number}.</span>
      )}
      <div>{children}</div>
    </div>
  )
}

// h1 is already rendered by the lesson page — suppress duplicates from MDX source
const components = {
  Step,
  h1: () => null,
}

export default function MDXContent({ source }: { source: string }) {
  return (
    <div className="mdx-prose">
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  )
}
