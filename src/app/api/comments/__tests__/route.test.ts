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
  sendCommentNotification: mockSendEmail
}))

function makeRequest(body: object) {
  return new Request('http://localhost/api/comments', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
}

const validBody = {
  post_slug: '2026-05-06-llms-en-produccion',
  author_name: 'Ana García',
  author_email: 'ana@example.com',
  body: 'Excelente artículo, muy útil.',
  website: '' // honeypot must be empty
}

describe('POST /api/comments', () => {
  beforeEach(() => {
    mockInsert.mockReset()
    mockSendEmail.mockReset()
    mockInsert.mockResolvedValue({ error: null })
    mockSendEmail.mockResolvedValue(undefined)
  })

  it('returns 200 and success:true for valid submission', async () => {
    const res = await POST(makeRequest(validBody))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('inserts comment as unapproved into Supabase', async () => {
    await POST(makeRequest(validBody))
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        post_slug: validBody.post_slug,
        author_name: validBody.author_name,
        author_email: validBody.author_email,
        body: validBody.body,
        approved: false
      })
    )
  })

  it('calls sendCommentNotification after successful insert', async () => {
    await POST(makeRequest(validBody))
    expect(mockSendEmail).toHaveBeenCalledOnce()
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        post_slug: validBody.post_slug,
        author_name: validBody.author_name,
        author_email: validBody.author_email,
        body: validBody.body
      })
    )
  })

  it('returns 200 even when sendCommentNotification throws (best-effort)', async () => {
    mockSendEmail.mockRejectedValue(new Error('Resend unavailable'))
    const res = await POST(makeRequest(validBody))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('does not call sendCommentNotification when Supabase insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } })
    await POST(makeRequest(validBody))
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(500)
  })

  it('returns 400 when honeypot field is filled (bot)', async () => {
    const res = await POST(makeRequest({ ...validBody, website: 'http://spam.com' }))
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 400 when author_name is missing', async () => {
    const res = await POST(makeRequest({ ...validBody, author_name: '' }))
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid email', async () => {
    const res = await POST(makeRequest({ ...validBody, author_email: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for malformed JSON body', async () => {
    const res = await POST(
      new Request('http://localhost/api/comments', {
        method: 'POST',
        body: 'not valid json {',
        headers: { 'Content-Type': 'application/json' }
      })
    )
    expect(res.status).toBe(400)
  })
})
