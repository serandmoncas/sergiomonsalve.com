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

  it('renders About and Contact links', () => {
    render(<Nav />)
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })
})
