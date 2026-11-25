'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { safeNext } from '@/lib/auth/safe-next'
import { MANUAL_ES_BASE } from '@/lib/manual/paths'

function Formulario() {
  const t = useTranslations('manual.entrar')
  const next = useSearchParams().get('next')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const destino = safeNext(next, `${MANUAL_ES_BASE}/mapa`)
    try {
      const { error } = await createClient().auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destino)}`,
        },
      })
      // Siempre "enviado": cualquier diferencia revelaría quién está invitado.
      if (error && error.status !== 400 && error.status !== 422) {
        console.error(`[manual] signInWithOtp: ${error.status ?? ''} ${error.message ?? ''}`)
      }
      setStatus('sent')
    } catch {
      // Sin respuesta alguna (red caída): único caso con error visible.
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return <p className="font-mono text-xs text-accent">{t('enviado')}</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="manual-email" className="font-mono text-xs text-text-muted block mb-1">{t('email')}</label>
        <input
          id="manual-email"
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-surface border border-border focus:border-accent outline-none px-3 py-2 text-xs text-text font-mono rounded-sm transition-colors"
        />
      </div>
      {status === 'error' && <p className="font-mono text-xs text-red-400">{t('error')}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full font-mono text-xs bg-accent text-background px-5 py-2 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {status === 'loading' ? t('enviando') : t('enviar')}
      </button>
    </form>
  )
}

export default function EntrarPage() {
  const t = useTranslations('manual.entrar')
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-text mb-8">{t('titulo')}</h1>
        <Suspense>
          <Formulario />
        </Suspense>
      </div>
    </div>
  )
}
