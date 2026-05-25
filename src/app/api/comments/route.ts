import { NextResponse } from 'next/server'
import { commentSchema } from '@/lib/comment-schema'
import { createAdminClient } from '@/lib/supabase/server'
import { sendCommentNotification } from '@/lib/resend'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = commentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { post_slug, author_name, author_email, body: commentBody } = parsed.data
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('comments')
    .insert({ post_slug, author_name, author_email, body: commentBody, approved: false })

  if (error) {
    console.error('Comment insert error:', error)
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 })
  }

  try {
    await sendCommentNotification({ post_slug, author_name, author_email, body: commentBody })
  } catch (emailError) {
    console.error('Comment notification error:', emailError)
    // Don't fail the request — comment was saved, email is best-effort
  }

  return NextResponse.json({ success: true })
}
