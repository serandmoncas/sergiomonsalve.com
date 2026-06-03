import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkActiveEnrollment } from '@/lib/cursos/enrollment'

export async function GET(
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

  // Resolve course.id from slug so we can scope the lesson lookup to this course
  const { data: course } = await admin
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Join through modules to verify the lesson belongs to this course (prevents IDOR)
  const { data: lesson } = await admin
    .from('lessons')
    .select('content_mdx, youtube_video_id, template_ref, modules!inner(course_id)')
    .eq('id', lessonId)
    .eq('modules.course_id', course.id)
    .single()

  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  return NextResponse.json({
    content_mdx: lesson.content_mdx,
    youtube_video_id: lesson.youtube_video_id,
    template_ref: lesson.template_ref,
  })
}
