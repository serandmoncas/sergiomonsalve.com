import { NextResponse } from 'next/server'
import { contactSchema } from '@/lib/contact-schema'
import { createAdminClient } from '@/lib/supabase/server'
import { sendContactNotification } from '@/lib/resend'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { name, email, projectType, message } = parsed.data
  const supabase = createAdminClient()

  const { error: dbError } = await supabase
    .from('contact_submissions')
    .insert({ name, email, project_type: projectType, message })

  if (dbError) {
    console.error('Supabase insert error:', dbError)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }

  try {
    await sendContactNotification(parsed.data)
  } catch (emailError) {
    console.error('Resend error:', emailError)
    // Don't fail the request — submission was saved, email is best-effort
  }

  return NextResponse.json({ success: true })
}
