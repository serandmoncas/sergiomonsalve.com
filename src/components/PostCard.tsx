import { Link } from '@/i18n/navigation'
import type { PostMeta } from '@/lib/posts'

export default function PostCard({ post, locale }: { post: PostMeta; locale: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      locale={locale as 'es' | 'en'}
      className="block border border-border hover:border-accent transition-colors p-5 rounded-sm group"
    >
      <p className="font-mono text-xs text-text-muted mb-2">
        {post.date} · {post.readingTime}
      </p>
      <h2 className="text-sm font-semibold text-text group-hover:text-accent transition-colors mb-2">
        {post.title}
      </h2>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">{post.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {post.tags.map(tag => (
          <span key={tag} className="font-mono text-xs text-accent bg-surface border border-border-active px-2 py-0.5 rounded-sm">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
