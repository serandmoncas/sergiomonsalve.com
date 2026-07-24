import { redirect, notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkActiveEnrollment } from '@/lib/cursos/enrollment'
import LessonSidebar from '@/components/cursos/LessonSidebar'
import LessonContent from '@/components/cursos/LessonContent'
import ProgressBar from '@/components/cursos/ProgressBar'

export default async function AprenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ leccion?: string }>
}) {
  const { locale, slug } = await params
  const { leccion: lessonIdParam } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/cursos/login`)

  const admin = createAdminClient()

  const hasEnrollment = await checkActiveEnrollment(admin, user.id, slug)
  if (!hasEnrollment) redirect(`/${locale}/cursos/${slug}`)

  const { data: course } = await admin
    .from('courses')
    .select(`
      id, title, slug,
      modules(
        id, title, order, is_published,
        lessons(id, title, description, order, duration_minutes, template_ref, is_published, content_mdx, youtube_video_id)
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) notFound()

  const modules = (course.modules as {
    id: string; title: string; order: number; is_published: boolean
    lessons: {
      id: string; title: string; description: string | null; order: number
      duration_minutes: number | null; template_ref: string | null; is_published: boolean
      content_mdx: string | null; youtube_video_id: string | null
    }[]
  }[])
    .filter(m => m.is_published)
    .sort((a, b) => a.order - b.order)
    .map(m => ({
      ...m,
      lessons: m.lessons.filter(l => l.is_published).sort((a, b) => a.order - b.order)
    }))

  const allLessons = modules.flatMap(m => m.lessons)
  if (allLessons.length === 0) notFound()

  const activeLesson = lessonIdParam
    ? allLessons.find(l => l.id === lessonIdParam) ?? allLessons[0]
    : allLessons[0]

  const lessonIds = allLessons.map(l => l.id)
  const { data: progressRows } = await admin
    .from('lesson_progress')
    .select('lesson_id')
    .eq('student_id', user.id)
    .eq('completed', true)
    .in('lesson_id', lessonIds)

  const completedLessonIds = (progressRows ?? []).map(p => p.lesson_id)

  const sidebarModules = modules.map(m => ({
    id: m.id,
    title: m.title,
    description: null,
    order: m.order,
    lessons: m.lessons.map(l => ({
      id: l.id,
      title: l.title,
      description: l.description,
      duration_minutes: l.duration_minutes,
      order: l.order,
      template_ref: l.template_ref,
    }))
  }))

  // unused but needed to silence TS if translation key referenced elsewhere
  void await getTranslations({ locale, namespace: 'cursos' })

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link
          href={`/cursos/${slug}`}
          locale={locale}
          className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
        >
          ← {course.title}
        </Link>
      </div>

      <ProgressBar
        completed={completedLessonIds.length}
        total={allLessons.length}
      />

      <div className="flex gap-10">
        <LessonSidebar
          modules={sidebarModules}
          activeLessonId={activeLesson.id}
          completedLessonIds={completedLessonIds}
          courseSlug={slug}
        />

        <LessonContent
          lesson={activeLesson}
          courseSlug={slug}
          isCompleted={completedLessonIds.includes(activeLesson.id)}
        />
      </div>
    </div>
  )
}
