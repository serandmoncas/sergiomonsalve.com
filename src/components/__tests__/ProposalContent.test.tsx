import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import es from '@/messages/es.json'
import ProposalContent from '../ProposalContent'

function lookup(path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], es.propuesta)
}

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, vars?: Record<string, string>) => {
      const value = String(lookup(key) ?? key)
      return vars ? value.replace(/\{(\w+)\}/g, (_, n) => vars[n] ?? `{${n}}`) : value
    }
    t.raw = (key: string) => lookup(key)
    return t
  }
}))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  )
}))

describe('ProposalContent', () => {
  it('addresses the proposal to the company', () => {
    render(<ProposalContent company="Somos Internet" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Propuesta para Somos Internet')
  })

  it('uses a generic title without a company', () => {
    render(<ProposalContent company={null} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Propuesta: Sprint de Aprendizaje')
  })

  it('shows both prices in COP and USD', () => {
    render(<ProposalContent company={null} />)
    for (const price of ['COP 1.800.000', 'US$450', 'COP 12.000.000', 'US$3.000']) {
      expect(screen.getByText(price)).toBeInTheDocument()
    }
  })

  it('includes the company in the WhatsApp message and links contact with the training type', () => {
    render(<ProposalContent company="Somos Internet" />)
    const whatsapp = screen.getByRole('link', { name: es.propuesta.next.whatsapp })
    expect(decodeURIComponent(whatsapp.getAttribute('href')!)).toContain('Somos Internet')
    expect(screen.getByRole('link', { name: es.propuesta.next.contact })).toHaveAttribute('href', '/contact?tipo=training')
  })

  it('renders the four weeks of the Sprint', () => {
    render(<ProposalContent company={null} />)
    expect(screen.getAllByTestId('sprint-week')).toHaveLength(4)
  })
})
