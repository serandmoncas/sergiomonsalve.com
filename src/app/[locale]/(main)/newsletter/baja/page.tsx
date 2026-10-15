import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { confirmUnsubscribe } from './actions'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function NewsletterUnsubscribePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string | string[]; estado?: string | string[] }>
}) {
  const { locale } = await params
  const { token, estado } = await searchParams
  const t = await getTranslations({ locale, namespace: 'newsletter' })
  const tokenValue = typeof token === 'string' ? token : ''

  let title: string
  let text: string
  let showForm = false
  if (estado === 'ok') {
    title = t('doneTitle')
    text = t('doneText')
  } else if (estado === 'invalido' || !tokenValue) {
    title = t('invalidTitle')
    text = t('invalidText')
  } else {
    title = t('confirmTitle')
    text = t('confirmText')
    showForm = true
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-24 space-y-6">
      <p className="font-mono text-xs text-text-muted">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text text-balance">{title}</h1>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
      {showForm ? (
        <form action={confirmUnsubscribe}>
          <input type="hidden" name="token" value={tokenValue} />
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="bg-accent text-background font-mono text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            {t('confirmButton')}
          </button>
        </form>
      ) : (
        estado !== 'ok' && (
          <Link href="/contact" className="inline-block font-mono text-xs border border-border text-text-secondary px-4 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors">
            {t('contact')}
          </Link>
        )
      )}
    </div>
  )
}
