import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  claimCourseSeat,
  countConfirmed,
  confirmFromWaitlist,
  markEmailSent,
  RegistrationsUnavailable,
  type SeatInput
} from '../registrations'

type Result = { data: unknown; error: unknown; count?: number | null }
type Call = { table: string; method: string; args: unknown[] }

const { state } = vi.hoisted(() => ({
  state: { results: [] as Result[], calls: [] as Call[] }
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    rpc: async (fn: string, args: unknown) => {
      state.calls.push({ table: fn, method: 'rpc', args: [args] })
      return state.results.shift() ?? { data: null, error: null }
    },
    from: (table: string) => {
      const result = state.results.shift() ?? { data: null, error: null }
      const q: Record<string, unknown> = {}
      for (const method of ['select', 'insert', 'update', 'eq']) {
        q[method] = (...args: unknown[]) => {
          state.calls.push({ table, method, args })
          return q
        }
      }
      q.maybeSingle = async () => result
      q.then = (resolve: (r: Result) => unknown) => resolve(result)
      return q
    }
  })
}))

const INPUT: SeatInput = {
  email: 'ana@mail.com',
  name: 'Ana',
  whatsapp: '+573001112233',
  device: 'computer',
  aiExperience: 'never',
  goal: 'Escribir mejor',
  project: '',
  newsletter: false,
  closed: false
}

const calls = (method: string) => state.calls.filter(c => c.method === method)

beforeEach(() => {
  state.results = []
  state.calls = []
})

describe('claimCourseSeat', () => {
  it('calls claim_course_seat with the cohort and capacity and maps the row', async () => {
    state.results = [{ data: [{ status: 'confirmed', is_new: true, should_email: true }], error: null }]
    const r = await claimCourseSeat(INPUT)
    expect(r).toEqual({ status: 'confirmed', isNew: true, shouldEmail: true })
    const [rpc] = calls('rpc')
    expect(rpc.table).toBe('claim_course_seat')
    expect(rpc.args[0]).toMatchObject({
      p_cohort: 'ia-diciembre-2026',
      p_capacity: 20,
      p_closed: false,
      p_email: 'ana@mail.com',
      p_whatsapp: '+573001112233',
      p_device: 'computer',
      p_ai_experience: 'never',
      p_newsletter: false
    })
  })

  it('throws RegistrationsUnavailable when the table does not exist', async () => {
    state.results = [{ data: null, error: { code: '42P01', message: 'relation does not exist' } }]
    await expect(claimCourseSeat(INPUT)).rejects.toBeInstanceOf(RegistrationsUnavailable)
  })

  it('throws RegistrationsUnavailable when PostgREST cannot find the function', async () => {
    state.results = [{ data: null, error: { code: 'PGRST202', message: 'Could not find the function' } }]
    await expect(claimCourseSeat(INPUT)).rejects.toBeInstanceOf(RegistrationsUnavailable)
  })

  it('rethrows other errors as plain errors with their message', async () => {
    state.results = [{ data: null, error: { code: 'XX000', message: 'boom' } }]
    const err = await claimCourseSeat(INPUT).catch(e => e)
    expect(err).toBeInstanceOf(Error)
    expect(err).not.toBeInstanceOf(RegistrationsUnavailable)
    expect(err.message).toBe('boom')
  })
})

describe('countConfirmed', () => {
  it('returns the exact count of confirmed rows in the cohort', async () => {
    state.results = [{ data: null, error: null, count: 7 }]
    expect(await countConfirmed()).toBe(7)
    expect(calls('eq').map(c => c.args)).toEqual([['cohort', 'ia-diciembre-2026'], ['status', 'confirmed']])
  })

  it('returns null when Supabase fails (for example, table missing)', async () => {
    state.results = [{ data: null, error: { code: '42P01', message: 'missing' }, count: null }]
    expect(await countConfirmed()).toBeNull()
  })
})

describe('markEmailSent', () => {
  it('stamps last_email_sent_at for that cohort and email', async () => {
    await markEmailSent('ana@mail.com')
    expect(calls('update')[0].args[0]).toHaveProperty('last_email_sent_at')
    expect(calls('eq').map(c => c.args)).toEqual([['cohort', 'ia-diciembre-2026'], ['email', 'ana@mail.com']])
  })
})

describe('confirmFromWaitlist', () => {
  it('only promotes rows that are on the waitlist and returns the name', async () => {
    state.results = [{ data: { name: 'Ana' }, error: null }]
    expect(await confirmFromWaitlist('ana@mail.com')).toEqual({ name: 'Ana' })
    expect(calls('update')[0].args[0]).toEqual({ status: 'confirmed' })
    expect(calls('eq').map(c => c.args)).toEqual([
      ['cohort', 'ia-diciembre-2026'],
      ['email', 'ana@mail.com'],
      ['status', 'waitlist']
    ])
  })

  it('returns null when there was no waitlisted row', async () => {
    state.results = [{ data: null, error: null }]
    expect(await confirmFromWaitlist('nadie@mail.com')).toBeNull()
  })
})
