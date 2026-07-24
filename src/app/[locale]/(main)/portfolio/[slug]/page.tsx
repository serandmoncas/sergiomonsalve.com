import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getProject, getProjectSlugs } from '@/lib/portfolio'
import MDXContent from '@/components/MDXContent'

export function generateStaticParams({ params: { locale } }: { params: { locale: string } }) {
  return getProjectSlugs(locale).map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getProject(slug, locale)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/${locale}/portfolio/${slug}` },
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const project = getProject(slug, locale)
  if (!project) notFound()

  const t = await getTranslations({ locale, namespace: 'portfolio' })

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <Link
        href="/portfolio"
        className="font-mono text-xs text-text-muted hover:text-accent transition-colors mb-10 block"
      >
        {t('backToPortfolio')}
      </Link>

      {project.image && (
        <div className="relative aspect-video w-full mb-8 rounded-sm overflow-hidden border border-border">
          <Image src={project.image} alt={project.title} fill className="object-cover" />
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-text-muted">{project.date}</span>
          <span className="font-mono text-xs bg-surface border border-border px-2 py-0.5 rounded-sm text-text-muted">
            {t(`status.${project.status}`)}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text mb-1">
          {project.title}
        </h1>
        <p className="font-mono text-xs text-text-muted">{project.role}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          <div className="mdx-prose">
            <MDXContent source={project.content} />
          </div>
        </div>

        <aside className="lg:w-56 flex-shrink-0 space-y-8">
          {project.stack.length > 0 && (
            <div>
              <p className="font-mono text-xs text-text-muted mb-3">{t('stack')}</p>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map(tech => (
                  <span
                    key={tech}
                    className="font-mono text-xs text-accent bg-surface border border-border-active px-2 py-0.5 rounded-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(project.github || project.demo || (project.links ?? []).length > 0) && (
            <div>
              <p className="font-mono text-xs text-text-muted mb-3">{t('links')}</p>
              <div className="flex flex-col gap-2">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-text-secondary hover:text-accent transition-colors"
                  >
                    {t('github')} ↗
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-text-secondary hover:text-accent transition-colors"
                  >
                    {t('demo')} ↗
                  </a>
                )}
                {(project.links ?? []).map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
