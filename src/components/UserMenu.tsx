'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UserMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.refresh()
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/admin/login"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
        title="Login"
      >
        ›_
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-2 h-2 rounded-full bg-accent hover:opacity-80 transition-opacity"
        title="Modo editor"
        aria-label="Modo editor"
      />

      {open && (
        <div className="absolute right-0 top-6 w-44 bg-background border border-border rounded-sm shadow-lg z-50 py-2">
          <p className="font-mono text-[10px] text-accent px-3 py-1 mb-1">{'//'} modo editor</p>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="block font-mono text-xs text-text-secondary hover:text-accent hover:bg-surface px-3 py-1.5 transition-colors"
          >
            Admin →
          </Link>
          <Link
            href="/admin/biblioteca"
            onClick={() => setOpen(false)}
            className="block font-mono text-xs text-text-secondary hover:text-accent hover:bg-surface px-3 py-1.5 transition-colors"
          >
            Biblioteca →
          </Link>
          <Link
            href="/admin/comments"
            onClick={() => setOpen(false)}
            className="block font-mono text-xs text-text-secondary hover:text-accent hover:bg-surface px-3 py-1.5 transition-colors"
          >
            Comentarios →
          </Link>
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={signOut}
              className="w-full text-left font-mono text-xs text-text-muted hover:text-text hover:bg-surface px-3 py-1.5 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
