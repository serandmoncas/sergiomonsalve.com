import { createAdminClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'

type Comment = {
  id: string
  author_name: string
  body: string
  created_at: string
}

export default async function CommentList({
  postSlug,
  locale
}: {
  postSlug: string
  locale: string
}) {
  const t = await getTranslations({ locale, namespace: 'comments' })
  const supabase = createAdminClient()

  const { data: comments } = await supabase
    .from('comments')
    .select('id, author_name, body, created_at')
    .eq('post_slug', postSlug)
    .eq('approved', true)
    .order('created_at', { ascending: true })

  if (!comments || comments.length === 0) return null

  return (
    <div className="mt-12">
      <p className="font-mono text-xs text-accent mb-6">// {t('listTitle')} ({comments.length})</p>
      <div className="space-y-6">
        {(comments as Comment[]).map(c => (
          <div key={c.id} className="border-l-2 border-border pl-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-text font-semibold">{c.author_name}</span>
              <span className="font-mono text-xs text-text-muted">
                {new Date(c.created_at).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
