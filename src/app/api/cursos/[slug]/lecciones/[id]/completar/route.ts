import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkActiveEnrollment } from '@/lib/cursos/enrollment'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id: lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const hasEnrollment = await checkActiveEnrollment(admin, user.id, slug)
  if (!hasEnrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

  const now = new Date().toISOString()
  const { error } = await admin
    .from('lesson_progress')
    .upsert(
      { student_id: user.id, lesson_id: lessonId, completed: true, completed_at: now },
      { onConflict: 'student_id,lesson_id' }
    )

  if (error) {
    console.error('Progress upsert error:', error)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
