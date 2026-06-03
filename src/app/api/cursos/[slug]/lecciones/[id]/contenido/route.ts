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

  const { data: lesson } = await admin
    .from('lessons')
    .select('content_mdx, youtube_video_id, template_ref')
    .eq('id', lessonId)
    .single()

  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  return NextResponse.json({
    content_mdx: lesson.content_mdx,
    youtube_video_id: lesson.youtube_video_id,
    template_ref: lesson.template_ref,
  })
}
