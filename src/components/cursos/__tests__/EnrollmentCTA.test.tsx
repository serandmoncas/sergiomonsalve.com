import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EnrollmentCTA from '../EnrollmentCTA'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

global.fetch = vi.fn()

describe('EnrollmentCTA', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
  })

  it('shows enroll button when status is none', () => {
    render(<EnrollmentCTA courseSlug="personal-page-recipe" initialStatus="none" />)
    expect(screen.getByText('enroll')).toBeDefined()
  })

  it('shows continuar when status is approved', () => {
    render(<EnrollmentCTA courseSlug="personal-page-recipe" initialStatus="approved" />)
    expect(screen.getByText('continuar')).toBeDefined()
  })

  it('shows pendiente when status is pending', () => {
    render(<EnrollmentCTA courseSlug="personal-page-recipe" initialStatus="pending" />)
    expect(screen.getByText('pendiente')).toBeDefined()
  })

  it('calls enroll API on click and redirects on success', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ enrollment: { status: 'approved' } }) } as Response)
    render(<EnrollmentCTA courseSlug="personal-page-recipe" initialStatus="none" />)
    fireEvent.click(screen.getByText('enroll'))
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/cursos/personal-page-recipe/enrollar', expect.objectContaining({ method: 'POST' })))
  })
})
