'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { COHORTE } from '@/lib/curso-ia/cohorte'

type Status =
  | 'idle'
  | 'loading'
  | 'confirmed'
  | 'waitlist'
  | 'closedWaitlist'
  | 'error'
  | 'unavailable'
  | 'noLinks'
  | 'badWhatsapp'

type Props = { full: boolean; closed: boolean }

export default function InscripcionForm({ full, closed }: Props) {
  const t = useTranslations('cursoIa')
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    device: '',
    aiExperience: '',
    goal: '',
    project: '',
    privacy: false,
    newsletter: false,
    website: ''
  })
  const [status, setStatus] = useState<Status>('idle')
  const [emailFailed, setEmailFailed] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    setForm(f => ({ ...f, [key]: target.type === 'checkbox' ? target.checked : target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading' || !form.privacy) return
    setStatus('loading')
    try {
      const res = await fetch('/api/curso-ia/inscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const body: { status?: string; closed?: boolean; emailFailed?: boolean; error?: string; field?: string } =
        await res.json().catch(() => ({}))
      if (res.ok && body.status) {
        setEmailFailed(Boolean(body.emailFailed))
        return setStatus(body.status === 'confirmed' ? 'confirmed' : body.closed ? 'closedWaitlist' : 'waitlist')
      }
      if (res.status === 503) return setStatus('unavailable')
      if (body.error === 'links_not_allowed') return setStatus('noLinks')
      if (body.field === 'whatsapp') return setStatus('badWhatsapp')
      setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  const whatsappLink = (
    <a href={COHORTE.whatsapp.url} target="_blank" rel="noopener noreferrer" className="underline text-accent">
      WhatsApp {COHORTE.whatsapp.display}
    </a>
  )

  if (status === 'confirmed' || status === 'waitlist' || status === 'closedWaitlist') {
    const key =
      status === 'confirmed' ? 'form.successConfirmed' : status === 'waitlist' ? 'form.successWaitlist' : 'form.successClosed'
    return (
      <div className="border border-accent rounded-sm p-6 space-y-3" role="status">
        <p className="text-base font-semibold text-text">{t(key)}</p>
        {emailFailed && (
          <p className="text-sm text-text-secondary">
            {t('form.emailFailed')} {whatsappLink}
          </p>
        )}
      </div>
    )
  }

  const inputClass =
    'w-full bg-surface border border-border focus:border-border-active outline-none text-text text-base sm:text-sm px-3 py-3 rounded-sm placeholder:text-text-muted transition-colors'
  const labelClass = 'block font-mono text-xs text-text-muted mb-1.5'
  const choiceClass =
    'flex items-center gap-2 border border-border rounded-sm px-3 py-3 text-sm text-text cursor-pointer has-[:checked]:border-accent'
  const cta = closed ? t('form.ctaClosed') : full ? t('form.ctaWaitlist') : t('form.cta')

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ci-name" className={labelClass}>{t('form.name')}</label>
          <input id="ci-name" required maxLength={80} autoComplete="name" className={inputClass} value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label htmlFor="ci-email" className={labelClass}>{t('form.email')}</label>
          <input id="ci-email" type="email" required maxLength={254} autoComplete="email" className={inputClass} value={form.email} onChange={set('email')} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ci-whatsapp" className={labelClass}>{t('form.whatsapp')}</label>
          <input id="ci-whatsapp" type="tel" required maxLength={30} autoComplete="tel" inputMode="tel" placeholder="300 123 4567" className={inputClass} value={form.whatsapp} onChange={set('whatsapp')} />
          <p className="mt-1 text-xs text-text-muted">{t('form.whatsappHint')}</p>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className={labelClass}>{t('form.device')}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(['computer', 'phone'] as const).map(value => (
            <label key={value} className={choiceClass}>
              <input type="radio" name="device" value={value} required checked={form.device === value} onChange={set('device')} className="accent-accent" />
              {t(value === 'computer' ? 'form.deviceComputer' : 'form.devicePhone')}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className={labelClass}>{t('form.ai')}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(['never', 'sometimes', 'often'] as const).map(value => (
            <label key={value} className={choiceClass}>
              <input type="radio" name="aiExperience" value={value} required checked={form.aiExperience === value} onChange={set('aiExperience')} className="accent-accent" />
              {t(value === 'never' ? 'form.aiNever' : value === 'sometimes' ? 'form.aiSometimes' : 'form.aiOften')}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="ci-goal" className={labelClass}>{t('form.goal')}</label>
        <textarea id="ci-goal" required maxLength={500} rows={3} className={inputClass} value={form.goal} onChange={set('goal')} />
      </div>
      <div>
        <label htmlFor="ci-project" className={labelClass}>{t('form.project')}</label>
        <textarea id="ci-project" maxLength={300} rows={2} className={inputClass} value={form.project} onChange={set('project')} />
      </div>

      {/* Honeypot: invisible para personas */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="ci-website">Website</label>
        <input id="ci-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-text-secondary">
          <input type="checkbox" required checked={form.privacy} onChange={set('privacy')} className="mt-1 accent-accent" aria-label={t('form.privacy')} />
          <span>
            {t('form.privacy')}{' '}
            <Link href="/privacidad" className="underline">{t('form.privacyLink')}</Link>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-text-secondary">
          <input type="checkbox" checked={form.newsletter} onChange={set('newsletter')} className="mt-1 accent-accent" />
          <span>{t('form.newsletter')}</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full sm:w-auto font-mono text-sm bg-accent text-background font-bold px-6 py-3.5 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {status === 'loading' ? t('form.sending') : cta}
      </button>

      {status === 'error' && <p className="text-sm text-red-400" role="alert">{t('form.error')}</p>}
      {status === 'noLinks' && <p className="text-sm text-red-400" role="alert">{t('form.errorLinks')}</p>}
      {status === 'badWhatsapp' && <p className="text-sm text-red-400" role="alert">{t('form.errorWhatsapp')}</p>}
      {status === 'unavailable' && (
        <p className="text-sm text-red-400" role="alert">
          {t('form.errorUnavailable')} {whatsappLink}
        </p>
      )}
    </form>
  )
}
