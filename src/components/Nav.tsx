import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import LocaleSwitcher from './LocaleSwitcher'
import UserMenu from './UserMenu'

export default async function Nav() {
  const t = await getTranslations('nav')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
      <Link href="/" className="font-mono text-sm font-bold text-accent">
        SM
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/blog" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('blog')}
        </Link>
        <Link href="/portfolio" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('portfolio')}
        </Link>
        <Link href="/recipes" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('recipes')}
        </Link>
        <Link href="/cursos" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('cursos')}
        </Link>
        <Link href="/biblioteca" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('biblioteca')}
        </Link>
        <Link href="/guestbook" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('guestbook')}
        </Link>
        <Link href="/experiencias-ia" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('experienciasIa')}
        </Link>
        <Link href="/contact" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('contact')}
        </Link>
        <LocaleSwitcher />
        <UserMenu isLoggedIn={!!user} />
      </div>
    </nav>
  )
}
