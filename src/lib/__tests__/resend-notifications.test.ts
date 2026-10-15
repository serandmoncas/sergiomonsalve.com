import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  }
}))

import { sendContactNotification, sendCommentNotification, sendPlanEmail } from '../resend'

const contact = { name: 'Ana', email: 'ana@example.com', projectType: 'training' as const, message: 'Hola, quiero un taller.' }
const comment = { post_slug: 'post', author_name: 'Ana', author_email: 'ana@example.com', body: 'Buen artículo' }
const plan = { to: 'ana@example.com', name: 'Ana', locale: 'es' as const, plan: 'PLAN', unsubscribeUrl: 'https://x/baja?token=t' }

describe('owner notifications', () => {
  beforeEach(() => {
    send.mockReset().mockResolvedValue({ data: { id: '1' }, error: null })
    vi.stubEnv('CONTACT_EMAIL', 'contacto@example.com')
  })
  afterEach(() => vi.unstubAllEnvs())

  it.each([
    ['contact', () => sendContactNotification(contact)],
    ['comment', () => sendCommentNotification(comment)]
  ])('%s: sends to CONTACT_EMAIL', async (_label, run) => {
    await run()
    expect(send.mock.calls[0][0].to).toBe('contacto@example.com')
  })

  it.each([
    ['contact', () => sendContactNotification(contact)],
    ['comment', () => sendCommentNotification(comment)]
  ])('%s: throws when Resend returns an error object', async (_label, run) => {
    send.mockResolvedValue({ data: null, error: { message: 'API key is invalid' } })
    await expect(run()).rejects.toThrow('API key is invalid')
  })

  it.each([
    ['contact', () => sendContactNotification(contact)],
    ['comment', () => sendCommentNotification(comment)]
  ])('%s: throws a clear error without a valid CONTACT_EMAIL and does not call Resend', async (_label, run) => {
    vi.stubEnv('CONTACT_EMAIL', '""')
    await expect(run()).rejects.toThrow('CONTACT_EMAIL')
    expect(send).not.toHaveBeenCalled()
  })
})

describe('plan email reply-to', () => {
  beforeEach(() => send.mockReset().mockResolvedValue({ data: { id: '1' }, error: null }))
  afterEach(() => vi.unstubAllEnvs())

  it('sets replyTo when CONTACT_EMAIL is valid', async () => {
    vi.stubEnv('CONTACT_EMAIL', 'contacto@example.com')
    await sendPlanEmail(plan)
    expect(send.mock.calls[0][0].replyTo).toBe('contacto@example.com')
  })

  it('omits replyTo instead of failing when CONTACT_EMAIL is invalid', async () => {
    vi.stubEnv('CONTACT_EMAIL', '""')
    await sendPlanEmail(plan)
    expect(send.mock.calls[0][0]).not.toHaveProperty('replyTo')
  })
})
