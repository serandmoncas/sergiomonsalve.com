import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from '../ContactForm'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      'projectTypeLabel': '// tipo de proyecto',
      'projectTypes.freelance': 'Freelance',
      'projectTypes.fulltime': 'Full-time',
      'projectTypes.collaboration': 'Colaboración',
      'nameLabel': 'nombre',
      'namePlaceholder': 'Tu nombre',
      'emailLabel': 'email',
      'emailPlaceholder': 'tu@email.com',
      'messageLabel': 'mensaje',
      'messagePlaceholder': 'Cuéntame...',
      'submit': 'Enviar →',
      'whatsapp': '💬 WhatsApp directo',
      'success': '¡Mensaje enviado!',
      'error': 'Algo salió mal.'
    }
    return map[key] ?? key
  }
}))

global.fetch = vi.fn()

describe('ContactForm', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset()
  })

  it('renders all three project type buttons', () => {
    render(<ContactForm />)
    expect(screen.getByRole('button', { name: 'Freelance' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Full-time' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Colaboración' })).toBeInTheDocument()
  })

  it('renders name, email, and message fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText('nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('email')).toBeInTheDocument()
    expect(screen.getByLabelText('mensaje')).toBeInTheDocument()
  })

  it('activates the clicked project type button', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(screen.getByRole('button', { name: 'Full-time' }))
    expect(screen.getByRole('button', { name: 'Full-time' })).toHaveAttribute(
      'data-active',
      'true'
    )
  })

  it('shows success message after successful submit', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    )
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(screen.getByRole('button', { name: 'Freelance' }))
    await user.type(screen.getByLabelText('nombre'), 'Ana')
    await user.type(screen.getByLabelText('email'), 'ana@example.com')
    await user.type(screen.getByLabelText('mensaje'), 'Hola me gustaría trabajar contigo.')
    await user.click(screen.getByRole('button', { name: 'Enviar →' }))
    await waitFor(() => {
      expect(screen.getByText('¡Mensaje enviado!')).toBeInTheDocument()
    })
  })

  it('shows error message on API failure', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
    )
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(screen.getByRole('button', { name: 'Freelance' }))
    await user.type(screen.getByLabelText('nombre'), 'Ana')
    await user.type(screen.getByLabelText('email'), 'ana@example.com')
    await user.type(screen.getByLabelText('mensaje'), 'Hola me gustaría trabajar contigo.')
    await user.click(screen.getByRole('button', { name: 'Enviar →' }))
    await waitFor(() => {
      expect(screen.getByText('Algo salió mal.')).toBeInTheDocument()
    })
  })
})
