import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import EnrollmentCTA from '@/components/cursos/EnrollmentCTA'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const admin = createAdminClient()
  const { data: course } = await admin
    .from('courses')
    .select('title, description')
    .eq('slug', slug)
    .single()
  if (!course) return {}
  return {
    title: course.title,
    description: course.description,
    alternates: { canonical: `/${locale}/cursos/${slug}` }
  }
}

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'cursos' })
  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select(`
      id, title, slug, description, thumbnail_url, is_free,
      modules(
        id, title, description, order, is_published,
        lessons(id, title, description, order, duration_minutes, template_ref, is_published)
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) notFound()

  const modules = (course.modules as {
    id: string; title: string; description: string | null; order: number; is_published: boolean
    lessons: { id: string; title: string; duration_minutes: number | null; order: number; is_published: boolean }[]
  }[])
    .filter(m => m.is_published)
    .sort((a, b) => a.order - b.order)

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.filter(l => l.is_published).length, 0)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let enrollmentStatus: 'none' | 'pending' | 'approved' = 'none'
  if (user) {
    const { data: enrollment } = await admin
      .from('enrollments')
      .select('status, expires_at')
      .eq('student_id', user.id)
      .eq('course_id', course.id)
      .single()
    if (enrollment) {
      const isExpired = enrollment.expires_at && enrollment.expires_at < new Date().toISOString()
      enrollmentStatus = isExpired ? 'none' : enrollment.status as typeof enrollmentStatus
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link
        href="/cursos"
        locale={locale}
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-10 block"
      >
        ← {t('title')}
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-extrabold text-text">{course.title}</h1>
            {course.is_free && (
              <span className="font-mono text-xs text-accent border border-accent px-2 py-0.5 rounded-sm shrink-0">
                {t('free')}
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">{course.description}</p>
          <p className="font-mono text-xs text-text-muted mb-8">
            {modules.length} {t('modules')} · {totalLessons} {t('lessons')}
          </p>

          <EnrollmentCTA
            courseSlug={slug}
            initialStatus={enrollmentStatus}
          />
        </div>

        <div className="md:w-72">
          <p className="font-mono text-xs text-accent mb-4">// contenido</p>
          {modules.map((mod, idx) => (
            <div key={mod.id} className="mb-4">
              <p className="font-mono text-xs text-text font-semibold mb-1">
                {idx + 1}. {mod.title}
              </p>
              <ul className="space-y-0.5 pl-3">
                {mod.lessons
                  .filter(l => l.is_published)
                  .sort((a, b) => a.order - b.order)
                  .map(lesson => (
                    <li key={lesson.id} className="font-mono text-xs text-text-muted">
                      — {lesson.title}
                      {lesson.duration_minutes && (
                        <span className="ml-1 opacity-60">({lesson.duration_minutes}min)</span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
