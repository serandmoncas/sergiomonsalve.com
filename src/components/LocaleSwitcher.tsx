'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const otherLocale = locale === 'es' ? 'en' : 'es'

  function handleSwitch() {
    router.replace(pathname, { locale: otherLocale })
  }

  return (
    <button
      onClick={handleSwitch}
      className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
    >
      {otherLocale.toUpperCase()}
    </button>
  )
}
