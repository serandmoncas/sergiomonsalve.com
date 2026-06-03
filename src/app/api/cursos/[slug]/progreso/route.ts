import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const { data: modules } = await admin
    .from('modules')
    .select('id')
    .eq('course_id', course.id)

  const moduleIds = (modules ?? []).map(m => m.id)
  if (moduleIds.length === 0) return NextResponse.json({ progress: [] })

  const { data: lessons } = await admin
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds)

  const lessonIds = (lessons ?? []).map(l => l.id)
  if (lessonIds.length === 0) return NextResponse.json({ progress: [] })

  const { data: progress } = await admin
    .from('lesson_progress')
    .select('lesson_id, completed, completed_at')
    .eq('student_id', user.id)
    .eq('completed', true)
    .in('lesson_id', lessonIds)

  return NextResponse.json({ progress: progress ?? [] })
}
