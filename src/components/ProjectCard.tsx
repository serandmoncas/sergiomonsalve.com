import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { ProjectMeta } from '@/lib/portfolio'

type Labels = {
  viewCase: string
  status: { active: string; archived: string }
}

export default function ProjectCard({
  project,
  locale,
  labels,
}: {
  project: ProjectMeta
  locale: string
  labels: Labels
}) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      locale={locale as 'es' | 'en'}
      className="block border border-border hover:border-accent transition-colors rounded-sm group overflow-hidden"
    >
      <div className="relative aspect-video bg-surface">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs text-text-muted">// {project.slug}</span>
          </div>
        )}
        <span className="absolute top-2 right-2 font-mono text-xs bg-background/80 px-2 py-0.5 rounded-sm text-text-muted border border-border">
          {labels.status[project.status]}
        </span>
      </div>
      <div className="p-5">
        <h2 className="text-sm font-bold text-text group-hover:text-accent transition-colors mb-1">
          {project.title}
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.stack.map(tech => (
            <span
              key={tech}
              className="font-mono text-xs text-accent bg-surface border border-border-active px-2 py-0.5 rounded-sm"
            >
              {tech}
            </span>
          ))}
        </div>
        <span className="font-mono text-xs text-accent group-hover:underline">
          {labels.viewCase}
        </span>
      </div>
    </Link>
  )
}
