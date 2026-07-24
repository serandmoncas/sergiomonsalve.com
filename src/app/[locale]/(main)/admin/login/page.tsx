'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

export default function AdminLoginPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'es'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/admin/comments`
      }
    })
    setStatus(error ? 'error' : 'sent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs text-accent mb-2">// admin</p>
        <h1 className="text-2xl font-extrabold text-text mb-8">Login</h1>

        {status === 'sent' ? (
          <p className="font-mono text-xs text-accent">// check your email for the magic link</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs text-text-muted block mb-1">email</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-surface border border-border focus:border-accent outline-none px-3 py-2 text-xs text-text font-mono rounded-sm transition-colors"
              />
            </div>
            {status === 'error' && (
              <p className="font-mono text-xs text-red-400">// something went wrong</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full font-mono text-xs bg-accent text-background px-5 py-2 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {status === 'loading' ? '...' : 'Send magic link →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
