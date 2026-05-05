import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'

const { mockInsert, mockSendEmail } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockSendEmail: vi.fn()
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: () => ({ insert: mockInsert })
  })
}))

vi.mock('@/lib/resend', () => ({
  sendContactNotification: mockSendEmail
}))

function makeRequest(body: object) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
}

function makeRawRequest(body: string) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' }
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    mockInsert.mockReset()
    mockSendEmail.mockReset()
    mockInsert.mockResolvedValue({ error: null })
    mockSendEmail.mockResolvedValue(undefined)
  })

  const validBody = {
    name: 'Ana García',
    email: 'ana@example.com',
    projectType: 'freelance',
    message: 'Hola, me gustaría trabajar contigo en este proyecto.'
  }

  it('returns 200 and success:true for valid submission', async () => {
    const res = await POST(makeRequest(validBody))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('inserts into Supabase with snake_case project_type', async () => {
    await POST(makeRequest(validBody))
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ project_type: 'freelance' })
    )
  })

  it('calls sendContactNotification', async () => {
    await POST(makeRequest(validBody))
    expect(mockSendEmail).toHaveBeenCalledOnce()
  })

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ ...validBody, name: '' }))
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid email', async () => {
    const res = await POST(makeRequest({ ...validBody, email: 'bad' }))
    expect(res.status).toBe(400)
  })

  it('returns 500 when Supabase insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(500)
  })

  it('returns 200 even when sendContactNotification throws', async () => {
    mockSendEmail.mockRejectedValue(new Error('Resend unavailable'))
    const res = await POST(makeRequest(validBody))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('returns 400 for malformed JSON body', async () => {
    const res = await POST(makeRawRequest('not valid json {'))
    expect(res.status).toBe(400)
  })
})
