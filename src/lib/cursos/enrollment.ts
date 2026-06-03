import type { SupabaseClient } from '@supabase/supabase-js'

export async function checkActiveEnrollment(
  supabase: SupabaseClient,
  studentId: string,
  courseSlug: string
): Promise<boolean> {
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseSlug)
    .single()

  if (!course) return false

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, status, expires_at')
    .eq('student_id', studentId)
    .eq('course_id', course.id)
    .eq('status', 'approved')
    .single()

  if (!enrollment) return false
  if (enrollment.status !== 'approved') return false
  if (enrollment.expires_at && enrollment.expires_at < new Date().toISOString()) return false
  return true
}
