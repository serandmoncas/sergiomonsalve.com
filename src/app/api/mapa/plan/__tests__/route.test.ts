import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'

const { upsert, sendPlan, subscribe } = vi.hoisted(() => ({
  upsert: vi.fn(),
  sendPlan: vi.fn(),
  subscribe: vi.fn()
}))

vi.mock('@/lib/mapa/subscribers', () => ({ upsertSubscriber: upsert }))
vi.mock('@/lib/resend', () => ({ sendPlanEmail: sendPlan, subscribeNewsletterContact: subscribe }))

const valid = { email: 'Ana@Example.com', name: 'Ana', locale: 'es', plan: 'PLAN MAPA', newsletter: true, website: '' }
const req = (body: unknown) =>
  new Request('http://localhost/api/mapa/plan', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })

describe('POST /api/mapa/plan', () => {
  beforeEach(() => {
    upsert.mockReset().mockResolvedValue({ unsubscribeToken: 'tok' })
    sendPlan.mockReset().mockResolvedValue(undefined)
    subscribe.mockReset().mockResolvedValue(undefined)
  })

  it('saves, sends the plan and subscribes when newsletter is true', async () => {
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(upsert).toHaveBeenCalledWith({ email: 'ana@example.com', name: 'Ana', locale: 'es', newsletter: true })
    expect(sendPlan).toHaveBeenCalledWith({
      to: 'ana@example.com',
      name: 'Ana',
      locale: 'es',
      plan: 'PLAN MAPA',
      unsubscribeUrl: 'https://www.sergiomonsalve.com/es/newsletter/baja?token=tok'
    })
    expect(subscribe).toHaveBeenCalledWith('ana@example.com', 'Ana')
  })

  it('does not subscribe when newsletter is false', async () => {
    await POST(req({ ...valid, newsletter: false }))
    expect(sendPlan).toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('silently accepts bots that fill the honeypot', async () => {
    const res = await POST(req({ ...valid, website: 'http://spam' }))
    expect(res.status).toBe(200)
    expect(upsert).not.toHaveBeenCalled()
    expect(sendPlan).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON and invalid data', async () => {
    expect((await POST(req('{nope'))).status).toBe(400)
    expect((await POST(req({ ...valid, email: 'nope' }))).status).toBe(400)
  })

  it('returns 500 when saving fails and does not send', async () => {
    upsert.mockRejectedValue(new Error('db down'))
    const res = await POST(req(valid))
    expect(res.status).toBe(500)
    expect(sendPlan).not.toHaveBeenCalled()
  })

  it('returns 502 when the plan email fails', async () => {
    sendPlan.mockRejectedValue(new Error('resend down'))
    const res = await POST(req(valid))
    expect(res.status).toBe(502)
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('still succeeds when the newsletter sync fails', async () => {
    subscribe.mockRejectedValue(new Error('segment missing'))
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
  })
})
