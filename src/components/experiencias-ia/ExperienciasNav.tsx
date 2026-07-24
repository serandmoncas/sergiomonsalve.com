'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'

const VISTAS = [
  { href: '/experiencias-ia', label: 'Inicio' },
  { href: '/experiencias-ia/sesiones', label: 'Sesiones' },
  { href: '/experiencias-ia/cronograma', label: 'Cronograma' },
  { href: '/experiencias-ia/backlog', label: 'Backlog' },
  { href: '/experiencias-ia/quienes-somos', label: 'Quiénes somos' },
  { href: '/experiencias-ia/glosario', label: 'Glosario' },
] as const

export default function ExperienciasNav() {
  const pathname = usePathname()

  return (
    <nav className="exp-nav">
      <Link href="/experiencias-ia" className="exp-brand">
        Experiencias IA
      </Link>
      <div className="exp-nav-links">
        {VISTAS.map(vista => {
          const isActive =
            vista.href === '/experiencias-ia'
              ? pathname.endsWith('/experiencias-ia')
              : pathname.includes(vista.href)
          return (
            <Link key={vista.href} href={vista.href} className={isActive ? 'on' : undefined}>
              {vista.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
