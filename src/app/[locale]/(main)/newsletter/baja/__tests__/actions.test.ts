import { describe, it, expect, vi, beforeEach } from 'vitest'

const { unsubscribeByToken, unsubscribeContact, redirect } = vi.hoisted(() => ({
  unsubscribeByToken: vi.fn(),
  unsubscribeContact: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  })
}))

vi.mock('@/lib/mapa/subscribers', () => ({ unsubscribeByToken }))
vi.mock('@/lib/resend', () => ({ unsubscribeNewsletterContact: unsubscribeContact }))
vi.mock('next/navigation', () => ({ redirect }))

import { confirmUnsubscribe } from '../actions'

const form = (fields: Record<string, string>) => {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v))
  return fd
}

describe('confirmUnsubscribe', () => {
  beforeEach(() => {
    unsubscribeByToken.mockReset()
    unsubscribeContact.mockReset().mockResolvedValue(undefined)
  })

  it('unsubscribes and redirects to the done state', async () => {
    unsubscribeByToken.mockResolvedValue({ email: 'ana@example.com' })
    await expect(confirmUnsubscribe(form({ token: 't', locale: 'es' }))).rejects.toThrow('REDIRECT:/es/newsletter/baja?estado=ok')
    expect(unsubscribeContact).toHaveBeenCalledWith('ana@example.com')
  })

  it('redirects to the invalid state when the token is unknown', async () => {
    unsubscribeByToken.mockResolvedValue(null)
    await expect(confirmUnsubscribe(form({ token: 't', locale: 'en' }))).rejects.toThrow('REDIRECT:/en/newsletter/baja?estado=invalido')
    expect(unsubscribeContact).not.toHaveBeenCalled()
  })

  it('still confirms when the Resend sync fails', async () => {
    unsubscribeByToken.mockResolvedValue({ email: 'ana@example.com' })
    unsubscribeContact.mockRejectedValue(new Error('resend down'))
    await expect(confirmUnsubscribe(form({ token: 't', locale: 'es' }))).rejects.toThrow('estado=ok')
  })

  it('falls back to es for an unknown locale', async () => {
    unsubscribeByToken.mockResolvedValue(null)
    await expect(confirmUnsubscribe(form({ token: 't', locale: 'fr' }))).rejects.toThrow('REDIRECT:/es/newsletter/baja?estado=invalido')
  })
})
