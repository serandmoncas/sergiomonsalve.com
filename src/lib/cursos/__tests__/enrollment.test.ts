import { describe, it, expect, vi } from 'vitest'
import { checkActiveEnrollment } from '../enrollment'

function makeSupabase(enrollmentRow: object | null, courseRow: { id: string } | null = { id: 'course-1' }) {
  const enrollmentChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: enrollmentRow, error: enrollmentRow ? null : { code: 'PGRST116' } })
  }
  const courseChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: courseRow, error: courseRow ? null : { code: 'PGRST116' } })
  }
  return {
    from: vi.fn((table: string) => table === 'courses' ? courseChain : enrollmentChain)
  }
}

describe('checkActiveEnrollment', () => {
  it('returns true when approved with no expiry', async () => {
    const supabase = makeSupabase({ id: 'enroll-1', status: 'approved', expires_at: null })
    const result = await checkActiveEnrollment(supabase as never, 'student-1', 'personal-page-recipe')
    expect(result).toBe(true)
  })

  it('returns false when status is pending', async () => {
    const supabase = makeSupabase({ id: 'enroll-1', status: 'pending', expires_at: null })
    const result = await checkActiveEnrollment(supabase as never, 'student-1', 'personal-page-recipe')
    expect(result).toBe(false)
  })

  it('returns false when expires_at is in the past', async () => {
    const supabase = makeSupabase({ id: 'enroll-1', status: 'approved', expires_at: '2020-01-01T00:00:00Z' })
    const result = await checkActiveEnrollment(supabase as never, 'student-1', 'personal-page-recipe')
    expect(result).toBe(false)
  })

  it('returns true when expires_at is in the future', async () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    const supabase = makeSupabase({ id: 'enroll-1', status: 'approved', expires_at: future })
    const result = await checkActiveEnrollment(supabase as never, 'student-1', 'personal-page-recipe')
    expect(result).toBe(true)
  })

  it('returns false when course does not exist', async () => {
    const supabase = makeSupabase(null, null)
    const result = await checkActiveEnrollment(supabase as never, 'student-1', 'non-existent')
    expect(result).toBe(false)
  })

  it('returns false when no enrollment exists', async () => {
    const supabase = makeSupabase(null)
    const result = await checkActiveEnrollment(supabase as never, 'student-1', 'personal-page-recipe')
    expect(result).toBe(false)
  })
})
