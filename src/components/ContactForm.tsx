'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

type ProjectType = 'freelance' | 'fulltime' | 'collaboration'

const PROJECT_TYPES: ProjectType[] = ['freelance', 'fulltime', 'collaboration']

export default function ContactForm() {
  const t = useTranslations('contact')
  const [projectType, setProjectType] = useState<ProjectType | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!projectType) return
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, projectType, message })
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="font-mono text-sm text-accent">{t('success')}</p>
    )
  }

  const inputClass =
    'w-full bg-surface border border-border focus:border-border-active outline-none text-text text-sm px-3 py-2.5 rounded-sm font-mono placeholder:text-text-muted transition-colors'
  const labelClass = 'block font-mono text-xs text-text-muted mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="font-mono text-xs text-text-muted mb-3">{t('projectTypeLabel')}</p>
        <div className="flex gap-2 flex-wrap">
          {PROJECT_TYPES.map(type => (
            <button
              key={type}
              type="button"
              data-active={projectType === type}
              onClick={() => setProjectType(type)}
              className={`font-mono text-xs px-4 py-2 rounded-sm border transition-colors ${
                projectType === type
                  ? 'bg-accent text-background border-accent font-bold'
                  : 'bg-surface border-border text-text-secondary hover:border-accent hover:text-accent'
              }`}
            >
              {t(`projectTypes.${type}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          {t('nameLabel')}
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          {t('emailLabel')}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          {t('messageLabel')}
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={t('messagePlaceholder')}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === 'error' && (
        <p className="font-mono text-xs text-red-400">{t('error')}</p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={!projectType || status === 'loading'}
          className="bg-accent text-background font-mono text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {status === 'loading' ? '...' : t('submit')}
        </button>
        <a
          href="https://wa.me/573508025988"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-border-active text-accent font-mono text-xs px-4 py-2.5 rounded-sm hover:bg-surface transition-colors"
        >
          {t('whatsapp')}
        </a>
      </div>
    </form>
  )
}
