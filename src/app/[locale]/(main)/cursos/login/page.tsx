'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'

export default function CursosLoginPage() {
  const t = useTranslations('cursos')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setStatus('error')
    } else {
      router.push('/cursos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs text-accent mb-2">// cursos</p>
        <h1 className="text-2xl font-extrabold text-text mb-8">{t('login')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs text-text-muted block mb-1">{t('email')}</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface border border-border focus:border-accent outline-none px-3 py-2 text-xs text-text font-mono rounded-sm transition-colors"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-text-muted block mb-1">{t('password')}</label>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface border border-border focus:border-accent outline-none px-3 py-2 text-xs text-text font-mono rounded-sm transition-colors"
            />
          </div>
          {status === 'error' && (
            <p className="font-mono text-xs text-red-400">{t('error_auth')}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full font-mono text-xs bg-accent text-background px-5 py-2 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {status === 'loading' ? '...' : t('submit_login')}
          </button>
        </form>
        <p className="font-mono text-xs text-text-muted mt-6 text-center">
          ¿No tienes cuenta?{' '}
          <Link href="/cursos/registro" className="text-accent hover:underline">
            {t('registro')}
          </Link>
        </p>
      </div>
    </div>
  )
}
