'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/i18n/navigation'

const NAV = [
  { href: '/admin' as const, label: 'Overview', icon: '◈' },
  { href: '/admin/comments' as const, label: 'Comentarios', icon: '✦' },
  { href: '/admin/guestbook' as const, label: 'Firmas', icon: '◇' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-full lg:w-48 flex-shrink-0 flex flex-col gap-1">
      <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-3 px-2">
        // admin panel
      </p>
      {NAV.map(({ href, label, icon }) => {
        const active = pathname.endsWith(href) ||
          (href === '/admin' && (pathname.endsWith('/admin') || pathname.endsWith('/admin/')))
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-sm font-mono text-xs transition-colors ${
              active
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-text-secondary hover:text-text hover:bg-surface'
            }`}
          >
            <span className="text-[10px]">{icon}</span>
            {label}
          </Link>
        )
      })}
      <button
        onClick={signOut}
        className="flex items-center gap-2 px-2 py-1.5 rounded-sm font-mono text-xs text-text-muted hover:text-text transition-colors mt-auto"
      >
        <span className="text-[10px]">→</span>
        Salir
      </button>
    </aside>
  )
}
