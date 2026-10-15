import { describe, it, expect, vi, beforeEach } from 'vitest'
import es from '@/messages/es.json'
import { POST } from '../route'

const { claim, release, consent, sendPlan, subscribe } = vi.hoisted(() => ({
  claim: vi.fn(),
  release: vi.fn(),
  consent: vi.fn(),
  sendPlan: vi.fn(),
  subscribe: vi.fn()
}))

vi.mock('@/lib/mapa/subscribers', () => ({
  claimPlanSend: claim,
  releasePlanSend: release,
  recordNewsletterConsent: consent
}))
vi.mock('@/lib/resend', () => ({ sendPlanEmail: sendPlan, subscribeNewsletterContact: subscribe }))

const valid = { email: 'Ana@Example.com', name: 'Ana', locale: 'es', newsletter: true, website: '', data: es.mapa.example }
const req = (body: unknown) =>
  new Request('http://localhost/api/mapa/plan', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })

describe('POST /api/mapa/plan', () => {
  beforeEach(() => {
    claim.mockReset().mockResolvedValue({ unsubscribeToken: 'tok' })
    release.mockReset().mockResolvedValue(undefined)
    consent.mockReset().mockResolvedValue(undefined)
    sendPlan.mockReset().mockResolvedValue(undefined)
    subscribe.mockReset().mockResolvedValue(undefined)
  })

  it('claims, sends the server-built plan, then records consent and syncs Resend', async () => {
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(claim).toHaveBeenCalledWith({ email: 'ana@example.com', name: 'Ana', locale: 'es' })
    const sent = sendPlan.mock.calls[0][0]
    expect(sent).toMatchObject({
      to: 'ana@example.com',
      name: 'Ana',
      locale: 'es',
      unsubscribeUrl: 'https://www.sergiomonsalve.com/es/newsletter/baja?token=tok'
    })
    expect(sent.plan).toContain('Habilidad: SQL para analizar ventas')
    expect(consent).toHaveBeenCalledWith('ana@example.com')
    expect(subscribe).toHaveBeenCalledWith('ana@example.com', 'Ana')
    expect(sendPlan.mock.invocationCallOrder[0]).toBeLessThan(consent.mock.invocationCallOrder[0])
  })

  it('builds the plan in English for en', async () => {
    await POST(req({ ...valid, locale: 'en' }))
    expect(sendPlan.mock.calls[0][0].plan).toContain('MAPA PLAN · 30 DAYS')
  })

  it('ignores a client-supplied plan text', async () => {
    await POST(req({ ...valid, plan: 'Gana un premio' }))
    expect(sendPlan.mock.calls[0][0].plan).not.toContain('Gana un premio')
  })

  it('does not record consent or subscribe when newsletter is false', async () => {
    await POST(req({ ...valid, newsletter: false }))
    expect(sendPlan).toHaveBeenCalled()
    expect(consent).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('returns 429 without sending or recording consent during the cooldown', async () => {
    claim.mockResolvedValue(null)
    const res = await POST(req(valid))
    expect(res.status).toBe(429)
    expect(sendPlan).not.toHaveBeenCalled()
    expect(consent).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('silently accepts bots that fill the honeypot', async () => {
    const res = await POST(req({ ...valid, website: 'http://spam' }))
    expect(res.status).toBe(200)
    expect(claim).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON and invalid data', async () => {
    expect((await POST(req('{nope'))).status).toBe(400)
    expect((await POST(req({ ...valid, email: 'nope' }))).status).toBe(400)
    expect(claim).not.toHaveBeenCalled()
  })

  it('tells the client which field contains a link', async () => {
    const res = await POST(req({ ...valid, data: { ...valid.data, project: 'entra a evil.shop/login' } }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'links_not_allowed', field: 'data.project' })
  })

  it('returns 500 when claiming fails and does not send', async () => {
    claim.mockRejectedValue(new Error('db down'))
    const res = await POST(req(valid))
    expect(res.status).toBe(500)
    expect(sendPlan).not.toHaveBeenCalled()
  })

  it('returns 502 and releases the slot when the plan email fails', async () => {
    sendPlan.mockRejectedValue(new Error('resend down'))
    const res = await POST(req(valid))
    expect(res.status).toBe(502)
    expect(release).toHaveBeenCalledWith('ana@example.com')
    expect(consent).not.toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('still answers 502 when releasing the slot also fails', async () => {
    sendPlan.mockRejectedValue(new Error('resend down'))
    release.mockRejectedValue(new Error('db down'))
    expect((await POST(req(valid))).status).toBe(502)
  })

  it('still succeeds when recording consent or the Resend sync fails', async () => {
    consent.mockRejectedValue(new Error('db hiccup'))
    subscribe.mockRejectedValue(new Error('segment missing'))
    expect((await POST(req(valid))).status).toBe(200)
  })
})
