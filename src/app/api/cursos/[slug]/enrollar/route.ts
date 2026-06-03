import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(
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
    .select('id, slug, is_free')
    .eq('slug', slug)
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const { data: existing } = await admin
    .from('enrollments')
    .select('id, status, expires_at')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (existing) {
    return NextResponse.json({ enrollment: existing })
  }

  const now = new Date().toISOString()
  const newEnrollment = {
    student_id: user.id,
    course_id: course.id,
    status: course.is_free ? 'approved' : 'pending',
    ...(course.is_free ? { approved_at: now, expires_at: null } : {})
  }

  const { data: created, error } = await admin
    .from('enrollments')
    .insert([newEnrollment])

  if (error) {
    console.error('Enrollment insert error:', error)
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
  }

  return NextResponse.json({ enrollment: created?.[0] })
}
