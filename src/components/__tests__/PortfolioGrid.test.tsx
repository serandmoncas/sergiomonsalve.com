import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PortfolioGrid from '../PortfolioGrid'
import type { ProjectMeta } from '@/lib/portfolio'

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
  {
    slug: 'her',
    title: 'HER',
    description: 'Currículo de harness engineering',
    date: '2026-07-24',
    role: 'Curriculum Designer / AI Educator',
    stack: ['TypeScript', 'Claude Code'],
    github: 'https://github.com/serandmoncas/HER',
    demo: '',
    links: [],
    status: 'active',
    featured: false,
    image: '',
  },
]

const labels = {
  viewCase: 'Ver caso →',
  visitSite: 'Visitar sitio ↗',
  status: { active: 'activo', archived: 'archivado' },
  filterAll: 'Todos',
  filterLabel: '// filtrar por stack',
}

describe('PortfolioGrid', () => {
  it('renders all projects by default', () => {
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
    expect(screen.getByText('HER')).toBeInTheDocument()
  })

  it('renders a filter chip only for technologies used by 2+ projects, plus "Todos"', () => {
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Python' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TypeScript' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'FastAPI' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ollama' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Claude Code' })).not.toBeInTheDocument()
  })

  it('filters to only projects matching the clicked technology', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'Python' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
    expect(screen.queryByText('HER')).not.toBeInTheDocument()
  })

  it('clears the filter when the same technology chip is clicked again', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'Python' }))
    await user.click(screen.getByRole('button', { name: 'Python' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
    expect(screen.getByText('HER')).toBeInTheDocument()
  })

  it('clears the filter when "Todos" is clicked', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    await user.click(screen.getByRole('button', { name: 'Python' }))
    await user.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getByText('Brayan')).toBeInTheDocument()
    expect(screen.getByText('slogs')).toBeInTheDocument()
    expect(screen.getByText('HER')).toBeInTheDocument()
  })

  it('reflects the selected chip via aria-pressed', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid projects={projects} locale="es" labels={labels} />)
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Python' })).toHaveAttribute('aria-pressed', 'false')
    await user.click(screen.getByRole('button', { name: 'Python' }))
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Python' })).toHaveAttribute('aria-pressed', 'true')
  })
})
