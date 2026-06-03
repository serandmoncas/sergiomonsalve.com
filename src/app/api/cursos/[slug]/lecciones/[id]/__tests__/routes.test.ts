import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as postCompletar } from '../completar/route'
import { GET as getContenido } from '../contenido/route'

const { mockGetUser, mockCheckEnrollment, mockProgressUpsert, mockLessonQuery } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCheckEnrollment: vi.fn(),
  mockProgressUpsert: vi.fn(),
  mockLessonQuery: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
  createAdminClient: () => ({
    from: vi.fn((table: string) => {
      if (table === 'lesson_progress') return { upsert: mockProgressUpsert }
      if (table === 'lessons') return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: mockLessonQuery }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn() }
    })
  })
}))

vi.mock('@/lib/cursos/enrollment', () => ({
  checkActiveEnrollment: mockCheckEnrollment
}))

const routeParams = { params: Promise.resolve({ slug: 'personal-page-recipe', id: 'lesson-1' }) }

describe('POST /completar', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockCheckEnrollment.mockReset()
    mockProgressUpsert.mockReset()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await postCompletar(new Request('http://localhost'), routeParams)
    expect(res.status).toBe(401)
  })

  it('returns 403 when not enrolled', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockCheckEnrollment.mockResolvedValue(false)
    const res = await postCompletar(new Request('http://localhost'), routeParams)
    expect(res.status).toBe(403)
  })

  it('returns 200 and upserts progress when enrolled', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockCheckEnrollment.mockResolvedValue(true)
    mockProgressUpsert.mockResolvedValue({ error: null })
    const res = await postCompletar(new Request('http://localhost'), routeParams)
    expect(res.status).toBe(200)
    expect(mockProgressUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ lesson_id: 'lesson-1', completed: true }),
      { onConflict: 'student_id,lesson_id' }
    )
  })
})

describe('GET /contenido', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockCheckEnrollment.mockReset()
    mockLessonQuery.mockReset()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await getContenido(new Request('http://localhost'), routeParams)
    expect(res.status).toBe(401)
  })

  it('returns 403 when not enrolled', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockCheckEnrollment.mockResolvedValue(false)
    const res = await getContenido(new Request('http://localhost'), routeParams)
    expect(res.status).toBe(403)
  })

  it('returns lesson content when enrolled', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockCheckEnrollment.mockResolvedValue(true)
    mockLessonQuery.mockResolvedValue({
      data: { content_mdx: '# Hello', youtube_video_id: null, template_ref: 'main#setup' },
      error: null
    })
    const res = await getContenido(new Request('http://localhost'), routeParams)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.content_mdx).toBe('# Hello')
  })
})
