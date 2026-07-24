import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAllProjects } from '@/lib/portfolio'
import ProjectCard from '@/components/ProjectCard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('portfolioTitle'),
    description: t('portfolioDescription'),
    alternates: {
      canonical: `/${locale}/portfolio`,
      languages: { es: '/es/portfolio', en: '/en/portfolio' },
    },
  }
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'portfolio' })
  const projects = getAllProjects(locale)

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-text-muted mb-3">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">
        {t('pageTitle')}
      </h1>
      {projects.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale}
              labels={{
                viewCase: t('viewCase'),
                status: {
                  active: t('status.active'),
                  archived: t('status.archived'),
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
