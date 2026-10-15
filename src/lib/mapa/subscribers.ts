import { createAdminClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type ClaimInput = {
  email: string
  name: string
  locale: 'es' | 'en'
}

// Reserva el envío del plan de forma atómica (ver claim_plan_send en 006_subscribers.sql):
// crea el suscriptor si no existe y marca last_plan_sent_at solo si pasó el tiempo de espera.
// Devuelve null si la dirección sigue en espera.
export async function claimPlanSend(input: ClaimInput): Promise<{ unsubscribeToken: string } | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('claim_plan_send', {
    p_email: input.email,
    p_name: input.name,
    p_locale: input.locale
  })
  if (error) throw new Error(error.message)
  const row = (Array.isArray(data) ? data[0] : data) as { unsubscribe_token: string } | null | undefined
  return row ? { unsubscribeToken: row.unsubscribe_token } : null
}

export async function releasePlanSend(email: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('subscribers').update({ last_plan_sent_at: null }).eq('email', email)
  if (error) throw new Error(error.message)
}

export async function recordNewsletterConsent(email: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('subscribers')
    .update({ newsletter: true, status: 'active', consented_at: new Date().toISOString(), unsubscribed_at: null })
    .eq('email', email)
  if (error) throw new Error(error.message)
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
