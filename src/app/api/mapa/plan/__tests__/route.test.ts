import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import es from '@/messages/es.json'
import { POST } from '../route'

const { upsert, markSent, sendPlan, subscribe } = vi.hoisted(() => ({
  upsert: vi.fn(),
  markSent: vi.fn(),
  sendPlan: vi.fn(),
  subscribe: vi.fn()
}))

vi.mock('@/lib/mapa/subscribers', () => ({ upsertSubscriber: upsert, markPlanSent: markSent }))
vi.mock('@/lib/resend', () => ({ sendPlanEmail: sendPlan, subscribeNewsletterContact: subscribe }))

const NOW = new Date('2026-10-15T12:00:00.000Z')
const valid = { email: 'Ana@Example.com', name: 'Ana', locale: 'es', newsletter: true, website: '', data: es.mapa.example }
const req = (body: unknown) =>
  new Request('http://localhost/api/mapa/plan', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })

describe('POST /api/mapa/plan', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    upsert.mockReset().mockResolvedValue({ unsubscribeToken: 'tok', lastPlanSentAt: null })
    markSent.mockReset().mockResolvedValue(undefined)
    sendPlan.mockReset().mockResolvedValue(undefined)
    subscribe.mockReset().mockResolvedValue(undefined)
  })
  afterEach(() => vi.useRealTimers())

  it('saves, sends the server-built plan and subscribes when newsletter is true', async () => {
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(upsert).toHaveBeenCalledWith({ email: 'ana@example.com', name: 'Ana', locale: 'es', newsletter: true })
    const sent = sendPlan.mock.calls[0][0]
    expect(sent).toMatchObject({
      to: 'ana@example.com',
      name: 'Ana',
      locale: 'es',
      unsubscribeUrl: 'https://www.sergiomonsalve.com/es/newsletter/baja?token=tok'
    })
    expect(sent.plan).toContain('PLAN MAPA · 30 DÍAS')
    expect(sent.plan).toContain('Habilidad: SQL para analizar ventas')
    expect(markSent).toHaveBeenCalledWith('ana@example.com')
    expect(subscribe).toHaveBeenCalledWith('ana@example.com', 'Ana')
  })

  it('builds the plan in English for en', async () => {
    await POST(req({ ...valid, locale: 'en' }))
    expect(sendPlan.mock.calls[0][0].plan).toContain('MAPA PLAN · 30 DAYS')
  })

  it('ignores a client-supplied plan text', async () => {
    await POST(req({ ...valid, plan: 'Gana un premio' }))
    expect(sendPlan.mock.calls[0][0].plan).not.toContain('Gana un premio')
  })

  it('does not subscribe when newsletter is false', async () => {
    await POST(req({ ...valid, newsletter: false }))
    expect(sendPlan).toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('returns 429 and does not send when a plan went to that address less than 10 minutes ago', async () => {
    upsert.mockResolvedValue({ unsubscribeToken: 'tok', lastPlanSentAt: new Date(NOW.getTime() - 5 * 60_000) })
    const res = await POST(req(valid))
    expect(res.status).toBe(429)
    expect(sendPlan).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('sends again after 10 minutes', async () => {
    upsert.mockResolvedValue({ unsubscribeToken: 'tok', lastPlanSentAt: new Date(NOW.getTime() - 11 * 60_000) })
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(sendPlan).toHaveBeenCalled()
  })

  it('silently accepts bots that fill the honeypot', async () => {
    const res = await POST(req({ ...valid, website: 'http://spam' }))
    expect(res.status).toBe(200)
    expect(upsert).not.toHaveBeenCalled()
    expect(sendPlan).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON, invalid data and links', async () => {
    expect((await POST(req('{nope'))).status).toBe(400)
    expect((await POST(req({ ...valid, email: 'nope' }))).status).toBe(400)
    expect((await POST(req({ ...valid, data: { ...valid.data, skill: 'https://evil.example' } }))).status).toBe(400)
    expect(upsert).not.toHaveBeenCalled()
  })

  it('returns 500 when saving fails and does not send', async () => {
    upsert.mockRejectedValue(new Error('db down'))
    const res = await POST(req(valid))
    expect(res.status).toBe(500)
    expect(sendPlan).not.toHaveBeenCalled()
  })

  it('returns 502 when the plan email fails and does not mark it as sent', async () => {
    sendPlan.mockRejectedValue(new Error('resend down'))
    const res = await POST(req(valid))
    expect(res.status).toBe(502)
    expect(markSent).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('still succeeds when marking the send time or the newsletter sync fails', async () => {
    markSent.mockRejectedValue(new Error('db hiccup'))
    subscribe.mockRejectedValue(new Error('segment missing'))
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
  })
})
