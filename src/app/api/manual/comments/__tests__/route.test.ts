import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'

const { mockGetReader, mockInsert, mockSelectInsert, mockOrder, mockSelectList, mockEq, mockNotify } = vi.hoisted(() => ({
  mockGetReader: vi.fn(),
  mockInsert: vi.fn(),
  mockSelectInsert: vi.fn(),
  mockOrder: vi.fn(),
  mockSelectList: vi.fn(),
  mockEq: vi.fn(),
  mockNotify: vi.fn()
}))

vi.mock('@/lib/manual/access', () => ({ getReader: mockGetReader }))
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: (row: unknown) => {
        mockInsert(row)
        return { select: mockSelectInsert }
      },
      select: (cols: string) => {
        mockSelectList(cols)
        return { eq: mockEq }
      }
    })
  })
}))
vi.mock('@/lib/resend', () => ({ sendManualCommentNotification: mockNotify }))

const lector = { userId: 'u1', email: 'lia@example.com', name: 'Lia', isAdmin: false }

function post(body: object) {
  return new Request('http://localhost/api/manual/comments', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
}
const get = (q = '?slug=nota-de-prueba') => new Request(`http://localhost/api/manual/comments${q}`)

describe('POST /api/manual/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetReader.mockResolvedValue(lector)
    mockSelectInsert.mockResolvedValue({
      data: [{ id: 'c1', author_name: 'Lia', body: 'Lorem ipsum', created_at: '2026-11-25T10:00:00Z', user_id: 'u1' }],
      error: null
    })
    mockNotify.mockResolvedValue(undefined)
  })

  it('401 sin lector', async () => {
    mockGetReader.mockResolvedValue(null)
    expect((await POST(post({ note_slug: 'a', body: 'x' }))).status).toBe(401)
  })

  it('400 con cuerpo vacío o de 4001 caracteres', async () => {
    expect((await POST(post({ note_slug: 'a', body: '   ' }))).status).toBe(400)
    expect((await POST(post({ note_slug: 'a', body: 'x'.repeat(4001) }))).status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('400 con slug inválido', async () => {
    expect((await POST(post({ note_slug: '../x', body: 'hola' }))).status).toBe(400)
  })

  it('inserta con el nombre y correo del lector, no los del cuerpo', async () => {
    const res = await POST(post({ note_slug: 'nota-de-prueba', body: ' Lorem ipsum ', author_name: 'Otro', author_email: 'otro@example.com' }))
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith({
      note_slug: 'nota-de-prueba',
      user_id: 'u1',
      author_name: 'Lia',
      author_email: 'lia@example.com',
      body: 'Lorem ipsum'
    })
    const json = await res.json()
    expect(json.comment).toEqual({ id: 'c1', author_name: 'Lia', body: 'Lorem ipsum', created_at: '2026-11-25T10:00:00Z', mine: true })
    expect(JSON.stringify(json)).not.toContain('example.com')
  })

  it('notifica si no es admin, con nombre y sin correo', async () => {
    await POST(post({ note_slug: 'nota-de-prueba', body: 'Lorem ipsum' }))
    expect(mockNotify).toHaveBeenCalledWith({ note_slug: 'nota-de-prueba', author_name: 'Lia', body: 'Lorem ipsum' })
  })

  it('no notifica si es admin', async () => {
    mockGetReader.mockResolvedValue({ ...lector, isAdmin: true })
    await POST(post({ note_slug: 'nota-de-prueba', body: 'Lorem ipsum' }))
    expect(mockNotify).not.toHaveBeenCalled()
  })

  it('200 aunque falle la notificación', async () => {
    mockNotify.mockRejectedValue(new Error('boom'))
    expect((await POST(post({ note_slug: 'nota-de-prueba', body: 'Lorem ipsum' }))).status).toBe(200)
  })

  it('500 genérico si falla la base', async () => {
    mockSelectInsert.mockResolvedValue({ data: null, error: { message: 'secreto de la BD' } })
    const res = await POST(post({ note_slug: 'nota-de-prueba', body: 'Lorem ipsum' }))
    expect(res.status).toBe(500)
    expect(JSON.stringify(await res.json())).not.toContain('secreto')
  })
})

describe('GET /api/manual/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetReader.mockResolvedValue(lector)
    mockEq.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({
      data: [
        { id: 'c1', author_name: 'Lia', body: 'Lorem', created_at: '2026-11-25T10:00:00Z', user_id: 'u1' },
        { id: 'c2', author_name: 'Ben', body: 'Ipsum', created_at: '2026-11-25T11:00:00Z', user_id: 'u2' }
      ],
      error: null
    })
  })

  it('401 sin lector', async () => {
    mockGetReader.mockResolvedValue(null)
    expect((await GET(get())).status).toBe(401)
  })

  it('400 sin slug válido', async () => {
    expect((await GET(get(''))).status).toBe(400)
  })

  it('devuelve mine y no pide ni devuelve author_email', async () => {
    const res = await GET(get())
    const json = await res.json()
    expect(json.comments.map((c: { mine: boolean }) => c.mine)).toEqual([true, false])
    expect(json.comments[0]).not.toHaveProperty('user_id')
    expect(mockSelectList.mock.calls[0][0]).not.toContain('author_email')
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('500 genérico si falla la base', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'secreto' } })
    const res = await GET(get())
    expect(res.status).toBe(500)
    expect(JSON.stringify(await res.json())).not.toContain('secreto')
  })
})
