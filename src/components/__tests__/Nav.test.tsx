import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Nav from '../Nav'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es'
}))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() })
}))

describe('Nav', () => {
  it('renders SM logo', () => {
    render(<Nav />)
    expect(screen.getByText('SM')).toBeInTheDocument()
  })

  it('renders all nav links', () => {
    render(<Nav />)
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /portfolio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /recipes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })

  it('renders locale switcher button for the other locale', () => {
    render(<Nav />)
    expect(screen.getByRole('button', { name: /switch language to english/i })).toBeInTheDocument()
  })
})
