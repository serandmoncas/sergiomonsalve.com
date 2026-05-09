import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectCard from '../ProjectCard'
import type { ProjectMeta } from '@/lib/portfolio'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

const mockProject: ProjectMeta = {
  slug: 'slogs',
  title: 'slogs',
  description: 'Plataforma logística full-stack',
  date: '2026-05-08',
  role: 'Full Stack Developer',
  stack: ['TypeScript', 'Python'],
  github: 'https://github.com/serandmoncas/slogs',
  demo: '',
  status: 'active',
  featured: true,
  image: '/portfolio/slogs.png',
}

const labels = {
  viewCase: 'Ver caso →',
  status: { active: 'activo', archived: 'archivado' },
}

describe('ProjectCard', () => {
  it('renders project title', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('slogs')).toBeInTheDocument()
  })

  it('renders project description', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('Plataforma logística full-stack')).toBeInTheDocument()
  })

  it('renders all stack tags', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('renders a link to the detail page', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/portfolio/slogs')
  })

  it('renders the CTA text', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('Ver caso →')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<ProjectCard project={mockProject} locale="es" labels={labels} />)
    expect(screen.getByText('activo')).toBeInTheDocument()
  })
})
