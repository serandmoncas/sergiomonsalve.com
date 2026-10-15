'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { MapaData } from '@/lib/mapa/plan'

type Status = 'idle' | 'loading' | 'success' | 'error' | 'tooSoon' | 'noLinks'

export default function PlanEmailForm({ data, locale }: { data: MapaData; locale: 'es' | 'en' }) {
  const t = useTranslations('mapa')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/mapa/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, locale, newsletter, website, data })
      })
      if (res.ok) return setStatus('success')
      if (res.status === 429) return setStatus('tooSoon')
      const body: { error?: string } = await res.json().catch(() => ({}))
      setStatus(body.error === 'links_not_allowed' ? 'noLinks' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return <p className="font-mono text-sm text-accent" role="status">{t('email.success')}</p>
  }

  const inputClass = 'w-full bg-surface border border-border focus:border-border-active outline-none text-text text-sm px-3 py-2.5 rounded-sm font-mono placeholder:text-text-muted transition-colors'
  const labelClass = 'block font-mono text-xs text-text-muted mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-text">{t('email.title')}</h3>
        <p className="text-xs text-text-secondary">{t('email.hint')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="plan-email" className={labelClass}>{t('email.email')}</label>
          <input id="plan-email" type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder={t('email.emailPh')} className={inputClass} />
        </div>
        <div>
          <label htmlFor="plan-name" className={labelClass}>{t('email.name')}</label>
          <input id="plan-name" type="text" maxLength={80} value={name} onChange={e => setName(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="plan-website">website</label>
        <input id="plan-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>
      <label htmlFor="plan-newsletter" className="flex items-start gap-3 text-xs text-text-secondary leading-relaxed cursor-pointer">
        <input id="plan-newsletter" type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)} className="mt-0.5 accent-[var(--color-accent)]" />
        <span>
          {t('email.newsletter')}{' '}
          <Link href="/privacidad" className="underline hover:text-accent">{t('email.privacy')}</Link>
        </span>
      </label>
      {(status === 'error' || status === 'tooSoon' || status === 'noLinks') && (
        <p role="alert" className="font-mono text-xs text-red-400">{t(`email.${status}`)}</p>
      )}
      <button type="submit" disabled={status === 'loading'} aria-busy={status === 'loading'} className="bg-accent text-background font-mono text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40">
        {status === 'loading' ? t('email.sending') : t('email.submit')}
      </button>
    </form>
  )
}
