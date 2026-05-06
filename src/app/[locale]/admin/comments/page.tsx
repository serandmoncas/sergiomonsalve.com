'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/i18n/navigation'

type Comment = {
  id: string
  post_slug: string
  author_name: string
  author_email: string
  body: string
  approved: boolean
  created_at: string
}

export default function AdminCommentsPage() {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [])

  async function fetchComments() {
    const res = await fetch('/api/admin/comments')
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    const data = await res.json()
    setComments(data.comments ?? [])
    setLoading(false)
  }

  async function approve(id: string) {
    await fetch(`/api/admin/comments/${id}`, { method: 'PATCH' })
    setComments(cs => cs.map(c => c.id === id ? { ...c, approved: true } : c))
  }

  async function remove(id: string) {
    await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    setComments(cs => cs.filter(c => c.id !== id))
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const pending = comments.filter(c => !c.approved)
  const approved = comments.filter(c => c.approved)

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-xs text-accent mb-1">// admin</p>
          <h1 className="text-2xl font-extrabold text-text">Comments</h1>
        </div>
        <button
          onClick={signOut}
          className="font-mono text-xs text-text-muted hover:text-text transition-colors"
        >
          sign out →
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-text-muted">// loading...</p>
      ) : (
        <>
          <section className="mb-12">
            <p className="font-mono text-xs text-accent mb-4">
              // pending ({pending.length})
            </p>
            {pending.length === 0 ? (
              <p className="font-mono text-xs text-text-muted">// all clear</p>
            ) : (
              <div className="space-y-4">
                {pending.map(c => (
                  <CommentRow key={c.id} comment={c} onApprove={approve} onDelete={remove} />
                ))}
              </div>
            )}
          </section>

          <section>
            <p className="font-mono text-xs text-text-muted mb-4">
              // approved ({approved.length})
            </p>
            {approved.length > 0 && (
              <div className="space-y-4">
                {approved.map(c => (
                  <CommentRow key={c.id} comment={c} onDelete={remove} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function CommentRow({
  comment,
  onApprove,
  onDelete
}: {
  comment: Comment
  onApprove?: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="border border-border rounded-sm p-4 bg-surface">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <span className="font-mono text-xs text-text font-semibold">{comment.author_name}</span>
          <span className="font-mono text-xs text-text-muted ml-2">{comment.author_email}</span>
          <span className="font-mono text-xs text-text-muted ml-2">/{comment.post_slug}</span>
        </div>
        <span className="font-mono text-xs text-text-muted shrink-0">
          {new Date(comment.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">{comment.body}</p>
      <div className="flex gap-3">
        {onApprove && (
          <button
            onClick={() => onApprove(comment.id)}
            className="font-mono text-xs text-accent hover:underline"
          >
            approve
          </button>
        )}
        <button
          onClick={() => onDelete(comment.id)}
          className="font-mono text-xs text-red-400 hover:underline"
        >
          delete
        </button>
      </div>
    </div>
  )
}
