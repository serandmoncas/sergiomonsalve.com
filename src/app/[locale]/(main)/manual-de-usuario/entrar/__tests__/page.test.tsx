import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const { signInWithOtp, search } = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  search: { value: 'next=' + encodeURIComponent('/es/manual-de-usuario/n/x') },
}))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { signInWithOtp } }) }))
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(search.value) }))
vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => `T:${k}` }))

import EntrarPage from '../page'

async function enviar() {
  render(<EntrarPage />)
  fireEvent.change(screen.getByLabelText('T:email'), { target: { value: 'a@b.com' } })
  fireEvent.click(screen.getByRole('button'))
}

describe('entrar', () => {
  beforeEach(() => {
    signInWithOtp.mockReset()
    search.value = 'next=' + encodeURIComponent('/es/manual-de-usuario/n/x')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('llama signInWithOtp sin crear usuario y con redirect seguro', async () => {
    signInWithOtp.mockResolvedValue({ error: null })
    await enviar()
    await waitFor(() => expect(signInWithOtp).toHaveBeenCalled())
    const arg = signInWithOtp.mock.calls[0][0]
    expect(arg.options.shouldCreateUser).toBe(false)
    expect(arg.options.emailRedirectTo).toBe(
      `${window.location.origin}/auth/callback?next=${encodeURIComponent('/es/manual-de-usuario/n/x')}`)
  })
  it('next malicioso cae a /mapa', async () => {
    search.value = 'next=' + encodeURIComponent('//evil.com')
    signInWithOtp.mockResolvedValue({ error: null })
    await enviar()
    await waitFor(() => expect(signInWithOtp).toHaveBeenCalled())
    expect(signInWithOtp.mock.calls[0][0].options.emailRedirectTo)
      .toContain(encodeURIComponent('/es/manual-de-usuario/mapa'))
  })
  it.each([422, 429, 500])('error %i igual muestra enviado', async (status) => {
    signInWithOtp.mockResolvedValue({ error: { status } })
    await enviar()
    expect(await screen.findByText('T:enviado')).toBeInTheDocument()
  })
  it('error de red (lanza) muestra error genérico', async () => {
    signInWithOtp.mockRejectedValue(new Error('net'))
    await enviar()
    expect(await screen.findByText('T:error')).toBeInTheDocument()
  })
})
