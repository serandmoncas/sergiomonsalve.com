import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { send, create, update, addSegment } = vi.hoisted(() => ({
  send: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  addSegment: vi.fn()
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
    contacts = { create, update, segments: { add: addSegment } }
  }
}))

import { sendPlanEmail, subscribeNewsletterContact, unsubscribeNewsletterContact } from '../resend'

const planData = {
  to: 'ana@example.com',
  name: 'Ana',
  locale: 'es' as const,
  plan: 'PLAN <MAPA> & más',
  unsubscribeUrl: 'https://www.sergiomonsalve.com/es/newsletter/baja?token=t'
}

describe('sendPlanEmail', () => {
  beforeEach(() => {
    send.mockReset()
    send.mockResolvedValue({ data: { id: '1' }, error: null })
  })

  it('sends the plan with an unsubscribe link and escaped HTML', async () => {
    await sendPlanEmail(planData)
    const args = send.mock.calls[0][0]
    expect(args.to).toBe('ana@example.com')
    expect(args.subject).toBe('Tu plan MAPA de 30 días')
    expect(args.text).toContain('PLAN <MAPA> & más')
    expect(args.text).toContain(planData.unsubscribeUrl)
    expect(args.html).toContain('PLAN &lt;MAPA&gt; &amp; más')
    expect(args.html).toContain(planData.unsubscribeUrl)
  })

  it('uses English copy for en', async () => {
    await sendPlanEmail({ ...planData, locale: 'en' })
    expect(send.mock.calls[0][0].subject).toBe('Your 30-day MAPA plan')
  })

  it('throws when Resend returns an error object', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'domain not verified' } })
    await expect(sendPlanEmail(planData)).rejects.toThrow('domain not verified')
  })
})

describe('newsletter contacts', () => {
  beforeEach(() => {
    create.mockReset()
    update.mockReset()
    addSegment.mockReset()
    create.mockResolvedValue({ data: { id: 'c1' }, error: null })
    update.mockResolvedValue({ data: { id: 'c1' }, error: null })
    addSegment.mockResolvedValue({ data: { id: 's1' }, error: null })
    vi.stubEnv('RESEND_SEGMENT_ID', 'seg_123')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('creates the contact inside the segment', async () => {
    await subscribeNewsletterContact('ana@example.com', 'Ana')
    expect(create).toHaveBeenCalledWith({
      email: 'ana@example.com',
      firstName: 'Ana',
      unsubscribed: false,
      segments: [{ id: 'seg_123' }]
    })
    expect(update).not.toHaveBeenCalled()
  })

  it('falls back to update + add segment when the contact exists', async () => {
    create.mockResolvedValue({ data: null, error: { message: 'Contact already exists' } })
    await subscribeNewsletterContact('ana@example.com', '')
    expect(update).toHaveBeenCalledWith({ email: 'ana@example.com', unsubscribed: false })
    expect(addSegment).toHaveBeenCalledWith({ email: 'ana@example.com', segmentId: 'seg_123' })
  })

  it('marks the contact as unsubscribed', async () => {
    await unsubscribeNewsletterContact('ana@example.com')
    expect(update).toHaveBeenCalledWith({ email: 'ana@example.com', unsubscribed: true })
  })

  it('does nothing without RESEND_SEGMENT_ID', async () => {
    vi.stubEnv('RESEND_SEGMENT_ID', '')
    await subscribeNewsletterContact('ana@example.com', 'Ana')
    await unsubscribeNewsletterContact('ana@example.com')
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })
})
