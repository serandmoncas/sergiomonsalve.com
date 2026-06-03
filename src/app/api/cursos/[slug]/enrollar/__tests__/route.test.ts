import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'

const { mockGetUser, mockCourseQuery, mockEnrollmentQuery, mockEnrollmentInsert } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCourseQuery: vi.fn(),
  mockEnrollmentQuery: vi.fn(),
  mockEnrollmentInsert: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser }
  }),
  createAdminClient: () => ({
    from: vi.fn((table: string) => {
      if (table === 'courses') return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: mockCourseQuery }
      if (table === 'enrollments') return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockEnrollmentQuery,
        insert: mockEnrollmentInsert,
      }
      return {}
    })
  })
}))

function makeRequest(slug = 'personal-page-recipe') {
  return new Request(`http://localhost/api/cursos/${slug}/enrollar`, { method: 'POST' })
}

const freeCourse = { id: 'course-1', slug: 'personal-page-recipe', is_free: true }

describe('POST /api/cursos/[slug]/enrollar', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockCourseQuery.mockReset()
    mockEnrollmentQuery.mockReset()
    mockEnrollmentInsert.mockReset()
    mockCourseQuery.mockResolvedValue({ data: freeCourse, error: null })
    mockEnrollmentInsert.mockResolvedValue({ data: [{ id: 'enroll-1' }], error: null })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(makeRequest(), { params: Promise.resolve({ slug: 'personal-page-recipe' }) })
    expect(res.status).toBe(401)
  })

  it('returns 404 when course not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockCourseQuery.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    const res = await POST(makeRequest(), { params: Promise.resolve({ slug: 'bad-slug' }) })
    expect(res.status).toBe(404)
  })

  it('auto-approves enrollment for free course', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockEnrollmentQuery.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    mockEnrollmentInsert.mockResolvedValue({ data: [{ id: 'enroll-1', status: 'approved' }], error: null })
    const res = await POST(makeRequest(), { params: Promise.resolve({ slug: 'personal-page-recipe' }) })
    expect(res.status).toBe(200)
    expect(mockEnrollmentInsert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ status: 'approved' })])
    )
  })

  it('returns existing enrollment if already active', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockEnrollmentQuery.mockResolvedValue({ data: { id: 'enroll-1', status: 'approved', expires_at: null }, error: null })
    const res = await POST(makeRequest(), { params: Promise.resolve({ slug: 'personal-page-recipe' }) })
    expect(res.status).toBe(200)
    expect(mockEnrollmentInsert).not.toHaveBeenCalled()
  })
})
