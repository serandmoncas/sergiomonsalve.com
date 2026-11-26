import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '../route'
import { RegistrationsUnavailable } from '@/lib/curso-ia/registrations'

const { claim, markSent, count, sendEmail, sendOwner, courseNewsletter, subscribe } = vi.hoisted(() => ({
  claim: vi.fn(),
  markSent: vi.fn(),
  count: vi.fn(),
  sendEmail: vi.fn(),
  sendOwner: vi.fn(),
  courseNewsletter: vi.fn(),
  subscribe: vi.fn()
}))

vi.mock('@/lib/curso-ia/registrations', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/curso-ia/registrations')>()
  return { ...actual, claimCourseSeat: claim, markEmailSent: markSent, countConfirmed: count }
})
vi.mock('@/lib/resend', () => ({
  sendCourseEmail: sendEmail,
  sendCourseOwnerNotice: sendOwner,
  subscribeNewsletterContact: subscribe
}))
vi.mock('@/lib/mapa/subscribers', () => ({ recordCourseNewsletter: courseNewsletter }))

const valid = {
  name: 'Ana',
  email: 'Ana@Mail.com',
  whatsapp: '300 111 2233',
  device: 'computer',
  aiExperience: 'never',
  goal: 'Escribir mejor',
  project: '',
  privacy: true,
  newsletter: false,
  website: ''
}
const req = (body: unknown) =>
  new Request('http://localhost/api/curso-ia/inscripcion', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })

describe('POST /api/curso-ia/inscripcion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-01T15:00:00Z'))
    claim.mockReset().mockResolvedValue({ status: 'confirmed', isNew: true, shouldEmail: true })
    markSent.mockReset().mockResolvedValue(undefined)
    count.mockReset().mockResolvedValue(7)
    sendEmail.mockReset().mockResolvedValue(undefined)
    sendOwner.mockReset().mockResolvedValue(undefined)
    courseNewsletter.mockReset().mockResolvedValue(undefined)
    subscribe.mockReset().mockResolvedValue(undefined)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('confirms a seat, emails the person, marks the send and notifies the owner', async () => {
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'confirmed', closed: false, emailFailed: false })
    expect(claim).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'ana@mail.com', whatsapp: '+573001112233', closed: false })
    )
    expect(sendEmail).toHaveBeenCalledWith('ana@mail.com', expect.objectContaining({ subject: expect.stringMatching(/cupo/i) }))
    expect(markSent).toHaveBeenCalledWith('ana@mail.com')
    expect(sendOwner.mock.calls[0][0].subject).toContain('7/20')
  })

  it('sends the waitlist email when the cohort is full', async () => {
    claim.mockResolvedValue({ status: 'waitlist', isNew: true, shouldEmail: true })
    const res = await POST(req(valid))
    expect((await res.json()).status).toBe('waitlist')
    expect(sendEmail.mock.calls[0][1].text).toMatch(/lista de espera/)
  })

  it('passes closed=true after 19:00 Colombia on 9 Dec', async () => {
    vi.setSystemTime(new Date('2026-12-10T00:00:01Z'))
    claim.mockResolvedValue({ status: 'waitlist', isNew: true, shouldEmail: true })
    const res = await POST(req(valid))
    expect(claim).toHaveBeenCalledWith(expect.objectContaining({ closed: true }))
    expect(await res.json()).toMatchObject({ status: 'waitlist', closed: true })
    expect(sendEmail.mock.calls[0][1].text).toContain('Te avisamos del próximo')
  })

  it('does not re-send to a duplicate inside the 10-minute window', async () => {
    claim.mockResolvedValue({ status: 'confirmed', isNew: false, shouldEmail: false })
    const res = await POST(req(valid))
    expect(await res.json()).toEqual({ status: 'confirmed', closed: false, emailFailed: false })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(sendOwner).not.toHaveBeenCalled()
  })

  it('keeps the seat and reports emailFailed when the confirmation email fails', async () => {
    sendEmail.mockRejectedValue(new Error('resend down'))
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'confirmed', closed: false, emailFailed: true })
    expect(markSent).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalled()
  })

  it('does not report emailFailed when only marking the send fails', async () => {
    markSent.mockRejectedValue(new Error('db'))
    const res = await POST(req(valid))
    expect((await res.json()).emailFailed).toBe(false)
  })

  it('still answers 200 when the owner notice fails', async () => {
    sendOwner.mockRejectedValue(new Error('no CONTACT_EMAIL'))
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(console.error).toHaveBeenCalled()
  })

  it('records the newsletter only when asked, and tolerates failures', async () => {
    await POST(req(valid))
    expect(courseNewsletter).not.toHaveBeenCalled()

    courseNewsletter.mockRejectedValue(new Error('db'))
    const res = await POST(req({ ...valid, newsletter: true }))
    expect(courseNewsletter).toHaveBeenCalledWith('ana@mail.com', 'Ana')
    expect(res.status).toBe(200)
  })

  it('syncs the Resend contact after recording the newsletter consent', async () => {
    await POST(req({ ...valid, newsletter: true }))
    expect(subscribe).toHaveBeenCalledWith('ana@mail.com', 'Ana')
  })

  it('answers 503 unavailable when the migration is missing', async () => {
    claim.mockRejectedValue(new RegistrationsUnavailable('relation does not exist'))
    const res = await POST(req(valid))
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'unavailable' })
  })

  it('answers 500 save_failed on other database errors', async () => {
    claim.mockRejectedValue(new Error('boom'))
    const res = await POST(req(valid))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'save_failed' })
  })

  it('silently accepts a filled honeypot without touching anything', async () => {
    const res = await POST(req({ ...valid, website: 'spam' }))
    expect(await res.json()).toEqual({ success: true })
    expect(claim).not.toHaveBeenCalled()
  })

  it('rejects links in free text with the field name', async () => {
    const res = await POST(req({ ...valid, goal: 'ver https://x.co' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'links_not_allowed', field: 'goal' })
  })

  it('rejects an invalid WhatsApp with the field name', async () => {
    const res = await POST(req({ ...valid, whatsapp: '123' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid', field: 'whatsapp' })
  })

  it('rejects a malformed body', async () => {
    const res = await POST(req('{not json'))
    expect(res.status).toBe(400)
  })
})
