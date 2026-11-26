import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CursoIaBanner from '../CursoIaBanner'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}))

describe('CursoIaBanner', () => {
  it('links to the course page while registrations are open', () => {
    render(<CursoIaBanner now={new Date('2026-12-01T12:00:00Z')} />)
    expect(screen.getByRole('link', { name: 'formacionBanner.cta' })).toHaveAttribute('href', '/curso-ia')
  })

  it('disappears once the cohort has started', () => {
    const { container } = render(<CursoIaBanner now={new Date('2026-12-10T00:00:00Z')} />)
    expect(container).toBeEmptyDOMElement()
  })
})
