import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InscripcionForm from '../InscripcionForm'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}))

const fetchMock = vi.fn()

function fill() {
  fireEvent.change(screen.getByLabelText('form.name'), { target: { value: 'Ana' } })
  fireEvent.change(screen.getByLabelText('form.email'), { target: { value: 'ana@mail.com' } })
  fireEvent.change(screen.getByLabelText('form.whatsapp'), { target: { value: '300 111 2233' } })
  fireEvent.click(screen.getByLabelText('form.deviceComputer'))
  fireEvent.click(screen.getByLabelText('form.aiNever'))
  fireEvent.change(screen.getByLabelText('form.goal'), { target: { value: 'Escribir mejor' } })
  fireEvent.click(screen.getByLabelText(/form.privacy/))
}

const respond = (status: number, body: unknown) =>
  fetchMock.mockResolvedValue({ ok: status < 400, status, json: async () => body })

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('InscripcionForm', () => {
  it('posts the registration and shows the confirmed message', async () => {
    respond(200, { status: 'confirmed', closed: false, emailFailed: false })
    render(<InscripcionForm full={false} closed={false} />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'form.cta' }))
    await waitFor(() => expect(screen.getByText('form.successConfirmed')).toBeInTheDocument())
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/curso-ia/inscripcion')
    expect(JSON.parse(init.body)).toEqual({
      name: 'Ana',
      email: 'ana@mail.com',
      whatsapp: '300 111 2233',
      device: 'computer',
      aiExperience: 'never',
      goal: 'Escribir mejor',
      project: '',
      privacy: true,
      newsletter: false,
      website: ''
    })
  })

  it('shows the waitlist message', async () => {
    respond(200, { status: 'waitlist', closed: false, emailFailed: false })
    render(<InscripcionForm full={false} closed={false} />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'form.cta' }))
    await waitFor(() => expect(screen.getByText('form.successWaitlist')).toBeInTheDocument())
  })

  it('offers WhatsApp when the confirmation email failed', async () => {
    respond(200, { status: 'confirmed', closed: false, emailFailed: true })
    render(<InscripcionForm full={false} closed={false} />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'form.cta' }))
    await waitFor(() => expect(screen.getByText('form.emailFailed')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute('href', 'https://wa.me/573239105762')
  })

  it('offers WhatsApp when registrations are unavailable (503)', async () => {
    respond(503, { error: 'unavailable' })
    render(<InscripcionForm full={false} closed={false} />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'form.cta' }))
    await waitFor(() => expect(screen.getByText('form.errorUnavailable')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute('href', 'https://wa.me/573239105762')
  })

  it('does not submit without the privacy consent', () => {
    render(<InscripcionForm full={false} closed={false} />)
    fill()
    fireEvent.click(screen.getByLabelText(/form.privacy/))
    fireEvent.click(screen.getByRole('button', { name: 'form.cta' }))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('labels the button for the waitlist when the cohort is full', () => {
    render(<InscripcionForm full closed={false} />)
    expect(screen.getByRole('button', { name: 'form.ctaWaitlist' })).toBeInTheDocument()
  })

  it('shows the invalid WhatsApp message from the API', async () => {
    respond(400, { error: 'invalid', field: 'whatsapp' })
    render(<InscripcionForm full={false} closed={false} />)
    fill()
    fireEvent.click(screen.getByRole('button', { name: 'form.cta' }))
    await waitFor(() => expect(screen.getByText('form.errorWhatsapp')).toBeInTheDocument())
  })
})
