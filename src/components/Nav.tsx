import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import LocaleSwitcher from './LocaleSwitcher'

export default function Nav() {
  const t = useTranslations('nav')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
      <Link href="/" className="font-mono text-sm font-bold text-accent">
        SM
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/about" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('about')}
        </Link>
        <Link href="/blog" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('blog')}
        </Link>
        <Link href="/portfolio" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('portfolio')}
        </Link>
        <Link href="/recipes" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('recipes')}
        </Link>
        <Link href="/contact" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('contact')}
        </Link>
        <LocaleSwitcher />
      </div>
    </nav>
  )
}
