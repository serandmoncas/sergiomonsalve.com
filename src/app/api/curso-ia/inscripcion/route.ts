import { NextResponse } from 'next/server'
import { isClosed } from '@/lib/curso-ia/cohorte'
import { confirmedEmail, ownerNotice, waitlistEmail } from '@/lib/curso-ia/email-copy'
import {
  claimCourseSeat,
  countConfirmed,
  markEmailSent,
  RegistrationsUnavailable,
  type SeatClaim
} from '@/lib/curso-ia/registrations'
import { registrationSchema } from '@/lib/curso-ia/schema'
import { isHoneypotFilled, LINK_MESSAGE } from '@/lib/mapa/schema'
import { recordCourseNewsletter } from '@/lib/mapa/subscribers'
import { sendCourseEmail, sendCourseOwnerNotice, subscribeNewsletterContact } from '@/lib/resend'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (isHoneypotFilled(body)) return NextResponse.json({ success: true })

  const parsed = registrationSchema.safeParse(body)
  if (!parsed.success) {
    const issue = parsed.error.issues.find(i => i.message === LINK_MESSAGE) ?? parsed.error.issues[0]
    const field = issue.path.join('.')
    const error = issue.message === LINK_MESSAGE ? 'links_not_allowed' : 'invalid'
    return NextResponse.json({ error, field }, { status: 400 })
  }
  const registration = parsed.data
  const closed = isClosed(new Date())

  let claim: SeatClaim
  try {
    claim = await claimCourseSeat({ ...registration, closed })
  } catch (error) {
    console.error('Course seat claim error:', error)
    if (error instanceof RegistrationsUnavailable) {
      return NextResponse.json({ error: 'unavailable' }, { status: 503 })
    }
    return NextResponse.json({ error: 'save_failed' }, { status: 500 })
  }

  // El cupo ya es de la persona: si el correo falla no se devuelve, se avisa en la respuesta.
  let emailFailed = false
  if (claim.shouldEmail) {
    const message =
      claim.status === 'confirmed' ? confirmedEmail(registration.name) : waitlistEmail(registration.name, closed)
    try {
      await sendCourseEmail(registration.email, message)
    } catch (error) {
      emailFailed = true
      console.error('Course email error:', error)
    }
    if (!emailFailed) {
      try {
        await markEmailSent(registration.email)
      } catch (error) {
        console.error('Course email mark error:', error)
      }
    }
  }

  if (claim.isNew) {
    try {
      await sendCourseOwnerNotice(ownerNotice(registration, claim.status, await countConfirmed()))
    } catch (error) {
      console.error('Course owner notice error:', error)
    }

    if (registration.newsletter) {
      try {
        await recordCourseNewsletter(registration.email, registration.name)
        await subscribeNewsletterContact(registration.email, registration.name)
      } catch (error) {
        console.error('Course newsletter error:', error)
      }
    }
  }

  return NextResponse.json({ status: claim.status, closed, emailFailed })
}
