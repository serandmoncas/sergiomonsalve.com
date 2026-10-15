'use server'

import { redirect } from 'next/navigation'
import { unsubscribeByToken } from '@/lib/mapa/subscribers'
import { unsubscribeNewsletterContact } from '@/lib/resend'

export async function confirmUnsubscribe(formData: FormData) {
  const token = String(formData.get('token') ?? '')
  const rawLocale = String(formData.get('locale') ?? '')
  const locale = rawLocale === 'en' ? 'en' : 'es'

  const result = await unsubscribeByToken(token)
  if (result) {
    try {
      await unsubscribeNewsletterContact(result.email)
    } catch (error) {
      console.error('Resend unsubscribe error:', error)
    }
  }
  redirect(`/${locale}/newsletter/baja?estado=${result ? 'ok' : 'invalido'}`)
}
