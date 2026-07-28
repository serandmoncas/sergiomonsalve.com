import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PortfolioGrid from '../PortfolioGrid'
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

const projects: ProjectMeta[] = [
  {
    slug: 'brayan',
    title: 'Brayan',
    description: 'Agente de WhatsApp',
    date: '2026-07-24',
    role: 'AI Agent Engineer',
    stack: ['Python', 'FastAPI', 'Ollama'],
    github: 'https://github.com/serandmoncas/brayan',
    demo: '',
    links: [],
    status: 'active',
    featured: false,
    image: '',
  },
  {
    slug: 'slogs',
    title: 'slogs',
    description: 'Plataforma logística',
    date: '2026-05-08',
    role: 'Full Stack Developer',
    stack: ['TypeScript', 'Python'],
    github: 'https://github.com/serandmoncas/slogs',
    demo: '',
    links: [],
    status: 'active',
    featured: true,
    image: '',
  },
]

const labels = {
  viewCase: 'Ver caso →',
  status: { active: 'activo', archived: 'archivado' },
  filterAll: 'Todos',
  empty: 'próximamente',
}

describe('PortfolioGrid', () => {
  it('renders all projects by default', () => {
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
  })

  it('renders one filter chip per unique technology plus "Todos"', () => {
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Python' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FastAPI' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TypeScript' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ollama' })).toBeInTheDocument()
  })

  it('filters to only projects matching the clicked technology', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'FastAPI' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.queryByText('slogs')).not.toBeInTheDocument()
  })

  it('clears the filter when the same technology chip is clicked again', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'FastAPI' }))
    await user.click(screen.getByRole('button', { name: 'FastAPI' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
  })

  it('clears the filter when "Todos" is clicked', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'FastAPI' }))
    await user.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
  })

  it('shows the empty-state message when no project matches (defensive edge case)', async () => {
    const user = userEvent.setup()
    const singleTechProjects = [{ ...projects[0], stack: ['OnlyOnBrayan'] }]
    render(<PortfolioGrid projects={singleTechProjects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'OnlyOnBrayan' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
  })
})
