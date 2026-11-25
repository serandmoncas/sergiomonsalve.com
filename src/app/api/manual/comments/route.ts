import { NextResponse } from 'next/server'
import { getReader } from '@/lib/manual/access'
import { manualCommentSchema, noteSlugSchema } from '@/lib/manual/comment-schema'
import { createAdminClient } from '@/lib/supabase/server'
import { sendManualCommentNotification } from '@/lib/resend'

// Nunca se selecciona author_email: los lectores no ven el correo de otros.
const COLUMNS = 'id, author_name, body, created_at, user_id'

type Row = { id: string; author_name: string; body: string; created_at: string; user_id: string }

function toPublic(row: Row, userId: string) {
  return {
    id: row.id,
    author_name: row.author_name,
    body: row.body,
    created_at: row.created_at,
    mine: row.user_id === userId
  }
}

export async function GET(request: Request) {
  const reader = await getReader()
  if (!reader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const slug = noteSlugSchema.safeParse(new URL(request.url).searchParams.get('slug'))
  if (!slug.success) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })

  const { data, error } = await createAdminClient()
    .from('manual_comments')
    .select(COLUMNS)
    .eq('note_slug', slug.data)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Manual comments select error:', error)
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 })
  }

  return NextResponse.json({ comments: ((data ?? []) as Row[]).map((r) => toPublic(r, reader.userId)) })
}

export async function POST(request: Request) {
  const reader = await getReader()
  if (!reader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = manualCommentSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  const { note_slug, body } = parsed.data

  // Nombre y correo salen siempre del lector verificado, nunca de la petición.
  const { data, error } = await createAdminClient()
    .from('manual_comments')
    .insert({ note_slug, user_id: reader.userId, author_name: reader.name, author_email: reader.email, body })
    .select(COLUMNS)

  const row = (data as Row[] | null)?.[0]
  if (error || !row) {
    console.error('Manual comment insert error:', error)
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 })
  }

  if (!reader.isAdmin) {
    try {
      await sendManualCommentNotification({ note_slug, author_name: reader.name, body })
    } catch (emailError) {
      console.error('Manual comment notification error:', emailError)
      // El comentario ya se guardó; el correo es de mejor esfuerzo.
    }
  }

  return NextResponse.json({ comment: toPublic(row, reader.userId) })
}
