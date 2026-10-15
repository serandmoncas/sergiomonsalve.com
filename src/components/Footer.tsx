import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function Footer() {
  const t = await getTranslations('footer')
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-xs text-text-muted">
          © {new Date().getFullYear()} Sergio Monsalve
        </span>
        <div className="flex items-center gap-6">
          <Link href="/privacidad" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
            {t('privacy')}
          </Link>
          <a
            href="https://github.com/serandmoncas"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.instagram.com/samonsalvec/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/573508025988"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            WhatsApp
          </a>
          <a
            href="https://songosorhongo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            Songosorhongo
          </a>
        </div>
      </div>
    </footer>
  )
}
