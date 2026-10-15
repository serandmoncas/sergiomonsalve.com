import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FormacionContent from '../FormacionContent'

const messages: Record<string, unknown> = {
  'method.steps': [
    { letter: 'M', title: 'Mapear', text: 'm' },
    { letter: 'A', title: 'Aplicar', text: 'a' },
    { letter: 'P', title: 'Practicar lo difícil', text: 'p' },
    { letter: 'A', title: 'Ajustar', text: 'a2' },
  ],
  'credentials.items': ['15 años como profesor en EAFIT', 'AI Engineer'],
  'offers.items': [
    { audience: 'Empresas', title: 'Sprints de Aprendizaje', text: 't', bullets: ['b1'] },
    { audience: 'Personas', title: 'Cohortes en vivo', text: 't', bullets: ['b2'] },
  ],
}

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    t.raw = (key: string) => messages[key]
    return t
  },
}))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

describe('FormacionContent', () => {
  it('renders the four MAPA steps in order', () => {
    render(<FormacionContent />)
    const titles = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)
    expect(titles.slice(0, 4)).toEqual(['Mapear', 'Aplicar', 'Practicar lo difícil', 'Ajustar'])
  })

  it('renders both offers: companies and individuals', () => {
    render(<FormacionContent />)
    expect(screen.getByText('Sprints de Aprendizaje')).toBeInTheDocument()
    expect(screen.getByText('Cohortes en vivo')).toBeInTheDocument()
  })

  it('shows the teaching credential', () => {
    render(<FormacionContent />)
    expect(screen.getByText('15 años como profesor en EAFIT')).toBeInTheDocument()
  })

  it('links to the free MAPA template', () => {
    render(<FormacionContent />)
    expect(screen.getByRole('link', { name: 'method.tryTemplate' })).toHaveAttribute('href', '/mapa')
  })

  it('links the main CTA to the contact page with the training type and offers WhatsApp', () => {
    render(<FormacionContent />)
    expect(screen.getByRole('link', { name: 'cta.contact' })).toHaveAttribute('href', '/contact?tipo=training')
    expect(screen.getByRole('link', { name: 'cta.whatsapp' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/573508025988\?text=/)
  })
})
