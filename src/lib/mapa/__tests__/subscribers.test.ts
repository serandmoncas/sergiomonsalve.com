import { describe, it, expect, vi, beforeEach } from 'vitest'
import { claimPlanSend, releasePlanSend, recordNewsletterConsent, unsubscribeByToken } from '../subscribers'

type Result = { data: unknown; error: unknown }
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
      q.single = async () => result
      q.then = (resolve: (r: Result) => unknown) => resolve(result)
      return q
    }
  })
}))

const TOKEN = '6f1c2a5e-8d1b-4c3a-9e2f-0a1b2c3d4e5f'
const findCall = (method: string) => state.calls.find(c => c.method === method)

beforeEach(() => {
  state.results = []
  state.calls = []
})

describe('claimPlanSend', () => {
  it('claims the send slot atomically and returns the unsubscribe token', async () => {
    state.results = [{ data: [{ unsubscribe_token: TOKEN }], error: null }]
    const r = await claimPlanSend({ email: 'ana@example.com', name: 'Ana', locale: 'es' })
    expect(r).toEqual({ unsubscribeToken: TOKEN })
    const call = findCall('rpc')!
    expect(call.table).toBe('claim_plan_send')
    expect(call.args[0]).toEqual({ p_email: 'ana@example.com', p_name: 'Ana', p_locale: 'es' })
  })

  it('returns null when the address is still in its cooldown', async () => {
    state.results = [{ data: [], error: null }]
    expect(await claimPlanSend({ email: 'ana@example.com', name: '', locale: 'es' })).toBeNull()
  })

  it('throws when Supabase fails', async () => {
    state.results = [{ data: null, error: { message: 'boom' } }]
    await expect(claimPlanSend({ email: 'ana@example.com', name: '', locale: 'es' })).rejects.toThrow('boom')
  })

  it('never writes newsletter consent', async () => {
    state.results = [{ data: [{ unsubscribe_token: TOKEN }], error: null }]
    await claimPlanSend({ email: 'ana@example.com', name: '', locale: 'es' })
    expect(JSON.stringify(state.calls)).not.toContain('newsletter')
  })
})

describe('releasePlanSend', () => {
  it('clears the send time so the person can retry', async () => {
    await releasePlanSend('ana@example.com')
    expect(findCall('update')!.args[0]).toEqual({ last_plan_sent_at: null })
    expect(findCall('eq')!.args).toEqual(['email', 'ana@example.com'])
  })
})

describe('recordNewsletterConsent', () => {
  it('activates the subscription with a consent timestamp', async () => {
    await recordNewsletterConsent('ana@example.com')
    expect(findCall('update')!.args[0]).toMatchObject({
      newsletter: true,
      status: 'active',
      unsubscribed_at: null,
      consented_at: expect.any(String)
    })
    expect(findCall('eq')!.args).toEqual(['email', 'ana@example.com'])
  })

  it('throws when Supabase fails', async () => {
    state.results = [{ data: null, error: { message: 'boom' } }]
    await expect(recordNewsletterConsent('ana@example.com')).rejects.toThrow('boom')
  })
})

describe('unsubscribeByToken', () => {
  it('returns null for a malformed token without querying', async () => {
    expect(await unsubscribeByToken('abc')).toBeNull()
    expect(state.calls).toHaveLength(0)
  })

  it('marks the subscriber as unsubscribed and returns the email', async () => {
    state.results = [{ data: { email: 'ana@example.com' }, error: null }]
    expect(await unsubscribeByToken(TOKEN)).toEqual({ email: 'ana@example.com' })
    const patch = findCall('update')!.args[0] as Record<string, unknown>
    expect(patch).toMatchObject({ status: 'unsubscribed', newsletter: false })
    expect(findCall('eq')!.args).toEqual(['unsubscribe_token', TOKEN])
  })

  it('returns null when the token does not exist', async () => {
    state.results = [{ data: null, error: null }]
    expect(await unsubscribeByToken(TOKEN)).toBeNull()
  })
})
