import { NextResponse } from 'next/server'
import es from '@/messages/es.json'
import en from '@/messages/en.json'
import { buildPlan, type PlanCopy } from '@/lib/mapa/plan'
import { planRequestSchema, isHoneypotFilled } from '@/lib/mapa/schema'
import { markPlanSent, upsertSubscriber } from '@/lib/mapa/subscribers'
import { sendPlanEmail, subscribeNewsletterContact } from '@/lib/resend'

const SITE_URL = 'https://www.sergiomonsalve.com'
const RESEND_COOLDOWN_MS = 10 * 60_000
const PLAN_COPY: Record<'es' | 'en', PlanCopy> = { es: es.mapa.plan, en: en.mapa.plan }

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (isHoneypotFilled(body)) return NextResponse.json({ success: true })

  const parsed = planRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  const { email, name, locale, newsletter, data } = parsed.data

  let unsubscribeToken: string
  let lastPlanSentAt: Date | null
  try {
    ;({ unsubscribeToken, lastPlanSentAt } = await upsertSubscriber({ email, name, locale, newsletter }))
  } catch (error) {
    console.error('Subscriber upsert error:', error)
    return NextResponse.json({ error: 'save_failed' }, { status: 500 })
  }

  if (lastPlanSentAt && Date.now() - lastPlanSentAt.getTime() < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ error: 'too_soon' }, { status: 429 })
  }

  try {
    await sendPlanEmail({
      to: email,
      name,
      locale,
      plan: buildPlan(data, PLAN_COPY[locale]),
      unsubscribeUrl: `${SITE_URL}/${locale}/newsletter/baja?token=${unsubscribeToken}`
    })
  } catch (error) {
    console.error('Plan email error:', error)
    return NextResponse.json({ error: 'email_failed' }, { status: 502 })
  }

  try {
    await markPlanSent(email)
  } catch (error) {
    console.error('Mark plan sent error:', error)
  }

  if (newsletter) {
    try {
      await subscribeNewsletterContact(email, name)
    } catch (error) {
      console.error('Newsletter sync error:', error)
    }
  }

  return NextResponse.json({ success: true })
}
