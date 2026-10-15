import { createAdminClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type SubscriberInput = {
  email: string
  name: string
  locale: 'es' | 'en'
  newsletter: boolean
}

export async function upsertSubscriber(input: SubscriberInput): Promise<{ unsubscribeToken: string }> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data: existing, error: findError } = await supabase
    .from('subscribers')
    .select('id, unsubscribe_token')
    .eq('email', input.email)
    .maybeSingle()
  if (findError) throw new Error(findError.message)

  if (!existing) {
    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        email: input.email,
        name: input.name || null,
        locale: input.locale,
        source: 'mapa',
        newsletter: input.newsletter,
        consented_at: input.newsletter ? now : null
      })
      .select('unsubscribe_token')
      .single()
    if (error) throw new Error(error.message)
    return { unsubscribeToken: data.unsubscribe_token }
  }

  const patch: Record<string, unknown> = { locale: input.locale }
  if (input.name) patch.name = input.name
  if (input.newsletter) {
    Object.assign(patch, { newsletter: true, status: 'active', consented_at: now, unsubscribed_at: null })
  }
  const { error } = await supabase.from('subscribers').update(patch).eq('id', existing.id)
  if (error) throw new Error(error.message)
  return { unsubscribeToken: existing.unsubscribe_token }
}

export async function unsubscribeByToken(token: string): Promise<{ email: string } | null> {
  if (!UUID.test(token)) return null
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('subscribers')
    .update({ status: 'unsubscribed', newsletter: false, unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select('email')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? { email: data.email } : null
}
