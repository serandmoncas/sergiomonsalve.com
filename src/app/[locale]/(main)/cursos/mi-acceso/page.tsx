import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export default async function MiAccesoPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cursos' })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/cursos/login`)

  const admin = createAdminClient()

  const { data: enrollments } = await admin
    .from('enrollments')
    .select('id, status, requested_at, approved_at, expires_at, courses(id, title, slug, thumbnail_url)')
    .eq('student_id', user.id)
    .order('requested_at', { ascending: false })

  const name = (user.user_metadata?.name as string) || user.email

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-accent mb-2">// cursos</p>
      <h1 className="text-2xl font-extrabold text-text mb-2">{t('mi_acceso')}</h1>
      <p className="font-mono text-xs text-text-muted mb-10">{name}</p>

      {(!enrollments || enrollments.length === 0) ? (
        <div>
          <p className="font-mono text-xs text-text-muted mb-6">{t('no_enrollments')}</p>
          <Link href="/cursos" locale={locale} className="font-mono text-xs text-accent hover:underline">
            ← ver cursos disponibles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map(enrollment => {
            const course = enrollment.courses as unknown as { id: string; title: string; slug: string; thumbnail_url: string | null } | null
            if (!course) return null
            const isActive = enrollment.status === 'approved' && (!enrollment.expires_at || enrollment.expires_at > new Date().toISOString())
            return (
              <div key={enrollment.id} className="border border-border bg-surface rounded-sm p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-text font-semibold">{course.title}</p>
                  <p className="font-mono text-xs text-text-muted mt-1">
                    {enrollment.status === 'approved' ? (isActive ? 'activo' : 'vencido') : enrollment.status}
                  </p>
                </div>
                {isActive && (
                  <Link
                    href={`/cursos/${course.slug}/aprender`}
                    locale={locale}
                    className="font-mono text-xs bg-accent text-background px-4 py-2 rounded-sm hover:opacity-90 transition-opacity shrink-0"
                  >
                    {t('continuar')} →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
