import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/server'
import CourseCard from '@/components/cursos/CourseCard'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cursos' })
  return {
    title: t('title'),
    alternates: { canonical: `/${locale}/cursos` }
  }
}

export default async function CursosPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cursos' })
  const admin = createAdminClient()

  const { data: courses } = await admin
    .from('courses')
    .select(`
      id, title, slug, description, thumbnail_url, is_free,
      modules(id, lessons(id))
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const courseItems = (courses ?? []).map(c => {
    const modules = (c.modules as { id: string; lessons: { id: string }[] }[]) ?? []
    const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0)
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      thumbnail_url: c.thumbnail_url,
      is_free: c.is_free,
      module_count: modules.length,
      lesson_count: lessonCount,
      coming_soon: c.slug === 'personal-page-recipe',
    }
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-accent mb-2">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold text-text mb-10">{t('title')}</h1>

      {courseItems.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">{t('no_courses')}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {courseItems.map(course => (
            <CourseCard key={course.id} course={course} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
