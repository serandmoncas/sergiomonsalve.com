'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'

export default function RegistroPage() {
  const t = useTranslations('cursos')
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      router.push('/cursos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs text-accent mb-2">// cursos</p>
        <h1 className="text-2xl font-extrabold text-text mb-8">{t('registro')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs text-text-muted block mb-1">{t('name')}</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-surface border border-border focus:border-accent outline-none px-3 py-2 text-xs text-text font-mono rounded-sm transition-colors"
            />
          </div>
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
              minLength={6}
              className="w-full bg-surface border border-border focus:border-accent outline-none px-3 py-2 text-xs text-text font-mono rounded-sm transition-colors"
            />
          </div>
          {status === 'error' && (
            <p className="font-mono text-xs text-red-400">{errorMsg || t('error_auth')}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full font-mono text-xs bg-accent text-background px-5 py-2 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {status === 'loading' ? '...' : t('submit_registro')}
          </button>
        </form>
        <p className="font-mono text-xs text-text-muted mt-6 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link href="/cursos/login" className="text-accent hover:underline">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
