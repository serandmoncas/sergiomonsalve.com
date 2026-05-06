'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function CommentForm({ postSlug }: { postSlug: string }) {
  const t = useTranslations('comments')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({ author_name: '', author_email: '', body: '', website: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, post_slug: postSlug })
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return <p className="font-mono text-xs text-accent mt-8">// {t('success')}</p>
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-4">
      <p className="font-mono text-xs text-accent mb-4">// {t('title')}</p>

      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-text-muted block mb-1">{t('nameLabel')}</label>
          <input
            required
            value={form.author_name}
            onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
            placeholder={t('namePlaceholder')}
            className="w-full bg-surface border border-border focus:border-accent outline-none px-3 py-2 text-xs text-text font-mono rounded-sm transition-colors"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-text-muted block mb-1">{t('emailLabel')}</label>
          <input
            required
            type="email"
            value={form.author_email}
            onChange={e => setForm(f => ({ ...f, author_email: e.target.value }))}
            placeholder={t('emailPlaceholder')}
            className="w-full bg-surface border border-border focus:border-accent outline-none px-3 py-2 text-xs text-text font-mono rounded-sm transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="font-mono text-xs text-text-muted block mb-1">{t('bodyLabel')}</label>
        <textarea
          required
          rows={4}
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          placeholder={t('bodyPlaceholder')}
          className="w-full bg-surface border border-border focus:border-accent outline-none px-3 py-2 text-xs text-text font-mono rounded-sm transition-colors resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="font-mono text-xs text-red-400">// {t('error')}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="font-mono text-xs bg-accent text-background px-5 py-2 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {status === 'loading' ? '...' : t('submit')}
      </button>
    </form>
  )
}
