import { NextResponse } from 'next/server'
import { planRequestSchema, isHoneypotFilled } from '@/lib/mapa/schema'
import { upsertSubscriber } from '@/lib/mapa/subscribers'
import { sendPlanEmail, subscribeNewsletterContact } from '@/lib/resend'

const SITE_URL = 'https://www.sergiomonsalve.com'

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
  const { email, name, locale, plan, newsletter } = parsed.data

  let unsubscribeToken: string
  try {
    ;({ unsubscribeToken } = await upsertSubscriber({ email, name, locale, newsletter }))
  } catch (error) {
    console.error('Subscriber upsert error:', error)
    return NextResponse.json({ error: 'save_failed' }, { status: 500 })
  }

  try {
    await sendPlanEmail({
      to: email,
      name,
      locale,
      plan,
      unsubscribeUrl: `${SITE_URL}/${locale}/newsletter/baja?token=${unsubscribeToken}`
    })
  } catch (error) {
    console.error('Plan email error:', error)
    return NextResponse.json({ error: 'email_failed' }, { status: 502 })
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
