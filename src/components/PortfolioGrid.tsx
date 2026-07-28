'use client'

import { useMemo, useState } from 'react'
import ProjectCard from './ProjectCard'
import type { ProjectMeta } from '@/lib/portfolio'

type Labels = {
  viewCase: string
  status: { active: string; archived: string }
  filterAll: string
  filterLabel: string
}

export default function PortfolioGrid({
  projects,
  locale,
  labels,
}: {
  projects: ProjectMeta[]
  locale: string
  labels: Labels
}) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)

  const techs = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of projects) {
      for (const tech of project.stack) {
        counts.set(tech, (counts.get(tech) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tech]) => tech)
  }, [projects])

  const filtered = selectedTech
    ? projects.filter(project => project.stack.includes(selectedTech))
    : projects

  return (
    <div>
      <p className="font-mono text-xs text-text-muted mb-3">{labels.filterLabel}</p>
      <div className="flex flex-wrap gap-1.5 mb-8">
        <button
          type="button"
          aria-pressed={selectedTech === null}
          onClick={() => setSelectedTech(null)}
          className={`font-mono text-xs px-2.5 py-1 rounded-sm border transition-colors ${
            selectedTech === null
              ? 'border-accent text-accent bg-surface'
              : 'border-border text-text-secondary bg-surface hover:border-accent hover:text-accent'
          }`}
        >
          {labels.filterAll}
        </button>
        {techs.map(tech => (
          <button
            key={tech}
            type="button"
            aria-pressed={selectedTech === tech}
            onClick={() => setSelectedTech(current => (current === tech ? null : tech))}
            className={`font-mono text-xs px-2.5 py-1 rounded-sm border transition-colors ${
              selectedTech === tech
                ? 'border-accent text-accent bg-surface'
                : 'border-border text-text-secondary bg-surface hover:border-accent hover:text-accent'
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filtered.map(project => (
          <ProjectCard
            key={project.slug}
            project={project}
            locale={locale}
            labels={{ viewCase: labels.viewCase, status: labels.status }}
          />
        ))}
      </div>
    </div>
  )
}
