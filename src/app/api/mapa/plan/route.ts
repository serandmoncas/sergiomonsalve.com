import { NextResponse } from 'next/server'
import es from '@/messages/es.json'
import en from '@/messages/en.json'
import { buildPlan, type PlanCopy } from '@/lib/mapa/plan'
import { LINK_MESSAGE, planRequestSchema, isHoneypotFilled } from '@/lib/mapa/schema'
import { claimPlanSend, recordNewsletterConsent, releasePlanSend } from '@/lib/mapa/subscribers'
import { sendPlanEmail, subscribeNewsletterContact } from '@/lib/resend'

const SITE_URL = 'https://www.sergiomonsalve.com'
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
    const linkIssue = parsed.error.issues.find(issue => issue.message === LINK_MESSAGE)
    if (linkIssue) {
      return NextResponse.json({ error: 'links_not_allowed', field: linkIssue.path.join('.') }, { status: 400 })
    }
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  const { email, name, locale, newsletter, data } = parsed.data

  let claim: { unsubscribeToken: string } | null
  try {
    claim = await claimPlanSend({ email, name, locale })
  } catch (error) {
    console.error('Plan claim error:', error)
    return NextResponse.json({ error: 'save_failed' }, { status: 500 })
  }
  if (!claim) return NextResponse.json({ error: 'too_soon' }, { status: 429 })

  try {
    await sendPlanEmail({
      to: email,
      name,
      locale,
      plan: buildPlan(data, PLAN_COPY[locale]),
      unsubscribeUrl: `${SITE_URL}/${locale}/newsletter/baja?token=${claim.unsubscribeToken}`
    })
  } catch (error) {
    console.error('Plan email error:', error)
    try {
      await releasePlanSend(email)
    } catch (releaseError) {
      console.error('Plan release error:', releaseError)
    }
    return NextResponse.json({ error: 'email_failed' }, { status: 502 })
  }

  if (newsletter) {
    try {
      await recordNewsletterConsent(email)
      await subscribeNewsletterContact(email, name)
    } catch (error) {
      console.error('Newsletter consent/sync error:', error)
    }
  }

  return NextResponse.json({ success: true })
}
