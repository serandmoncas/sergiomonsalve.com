import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import es from '@/messages/es.json'
import type { MapaData } from '@/lib/mapa/plan'
import PlanEmailForm from '../PlanEmailForm'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}))

global.fetch = vi.fn()
const data = es.mapa.example as MapaData
const sentBody = () => JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)

async function submit(withNewsletter = false) {
  const user = userEvent.setup()
  render(<PlanEmailForm data={data} locale="es" />)
  await user.type(screen.getByLabelText('email.email'), 'ana@example.com')
  if (withNewsletter) await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: 'email.submit' }))
}

describe('PlanEmailForm', () => {
  beforeEach(() => vi.mocked(fetch).mockReset())

  it('starts with the newsletter box unchecked', () => {
    render(<PlanEmailForm data={data} locale="es" />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('posts the template data without newsletter by default and shows success', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }))
    await submit()
    await waitFor(() => expect(screen.getByText('email.success')).toBeInTheDocument())
    expect(sentBody()).toEqual({ email: 'ana@example.com', name: '', locale: 'es', newsletter: false, website: '', data })
  })

  it('sends newsletter: true when the box is checked', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }))
    await submit(true)
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(sentBody().newsletter).toBe(true)
  })

  it('shows an error and keeps the form when the API fails', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 502 }))
    await submit()
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('email.error'))
    expect(screen.getByLabelText('email.email')).toHaveValue('ana@example.com')
  })

  it('explains the cooldown on 429', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 429 }))
    await submit()
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('email.tooSoon'))
  })
})
