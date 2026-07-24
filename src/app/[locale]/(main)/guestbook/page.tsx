import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import GuestbookSignIn from '@/components/guestbook/GuestbookSignIn'
import GuestbookForm from '@/components/guestbook/GuestbookForm'
import GuestbookAuthHandler from '@/components/guestbook/GuestbookAuthHandler'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'guestbook' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: `/${locale}/guestbook` },
  }
}

export default async function GuestbookPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'guestbook' })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: entries } = await admin
    .from('guestbook_entries')
    .select('id, display_name, avatar_url, provider, message, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  const guestUser = user
    ? {
        display_name:
          user.user_metadata.full_name ||
          user.user_metadata.user_name ||
          user.user_metadata.name ||
          user.email ||
          'Anonymous',
        avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || null,
      }
    : null

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Suspense fallback={null}><GuestbookAuthHandler /></Suspense>
      <p className="font-mono text-xs text-accent mb-2">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-2">{t('title')}</h1>
      <p className="text-sm text-text-secondary mb-8">{t('description')}</p>

      {guestUser ? (
        <GuestbookForm
          user={guestUser}
          placeholder={t('formPlaceholder')}
          submitLabel={t('submit')}
          signedInAs={t('signedInAs')}
          signOutLabel={t('signOut')}
          pendingMsg={t('pendingApproval')}
        />
      ) : (
        <GuestbookSignIn
          label={t('signInPrompt')}
          signInWith={t('signInWith')}
          locale={locale}
        />
      )}

      <div className="mt-10 space-y-6">
        {!entries?.length && (
          <p className="font-mono text-xs text-text-muted">{t('empty')}</p>
        )}
        {entries?.map(entry => (
          <div key={entry.id} className="flex gap-3">
            {entry.avatar_url ? (
              <Image
                src={entry.avatar_url}
                alt={entry.display_name}
                width={36}
                height={36}
                className="rounded-full flex-shrink-0 mt-0.5"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-surface border border-border flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-text">{entry.display_name}</span>
                <span className="font-mono text-[10px] text-text-muted uppercase border border-border px-1.5 py-px rounded-sm">
                  {entry.provider}
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  {new Date(entry.created_at).toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{entry.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
