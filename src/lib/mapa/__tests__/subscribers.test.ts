import { describe, it, expect, vi, beforeEach } from 'vitest'
import { upsertSubscriber, unsubscribeByToken } from '../subscribers'

type Result = { data: unknown; error: unknown }
type Call = { table: string; method: string; args: unknown[] }

const { state } = vi.hoisted(() => ({
  state: { results: [] as Result[], calls: [] as Call[] }
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
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

describe('upsertSubscriber', () => {
  beforeEach(() => {
    state.results = []
    state.calls = []
  })

  it('inserts a new subscriber with consent when newsletter is true', async () => {
    state.results = [
      { data: null, error: null },
      { data: { unsubscribe_token: TOKEN }, error: null }
    ]
    const r = await upsertSubscriber({ email: 'ana@example.com', name: 'Ana', locale: 'es', newsletter: true })
    expect(r.unsubscribeToken).toBe(TOKEN)
    const row = findCall('insert')!.args[0] as Record<string, unknown>
    expect(row).toMatchObject({ email: 'ana@example.com', name: 'Ana', locale: 'es', source: 'mapa', newsletter: true })
    expect(row.consented_at).toEqual(expect.any(String))
  })

  it('inserts without consent when newsletter is false', async () => {
    state.results = [
      { data: null, error: null },
      { data: { unsubscribe_token: TOKEN }, error: null }
    ]
    await upsertSubscriber({ email: 'ana@example.com', name: '', locale: 'es', newsletter: false })
    const row = findCall('insert')!.args[0] as Record<string, unknown>
    expect(row).toMatchObject({ newsletter: false, consented_at: null, name: null })
  })

  it('reactivates an unsubscribed person who opts in again', async () => {
    state.results = [
      { data: { id: 'id-1', unsubscribe_token: TOKEN }, error: null },
      { data: null, error: null }
    ]
    await upsertSubscriber({ email: 'ana@example.com', name: 'Ana', locale: 'en', newsletter: true })
    const patch = findCall('update')!.args[0] as Record<string, unknown>
    expect(patch).toMatchObject({ locale: 'en', newsletter: true, status: 'active', unsubscribed_at: null, name: 'Ana' })
  })

  it('does not touch the subscription of a returning person who does not opt in', async () => {
    state.results = [
      { data: { id: 'id-1', unsubscribe_token: TOKEN }, error: null },
      { data: null, error: null }
    ]
    const r = await upsertSubscriber({ email: 'ana@example.com', name: '', locale: 'es', newsletter: false })
    expect(r.unsubscribeToken).toBe(TOKEN)
    const patch = findCall('update')!.args[0] as Record<string, unknown>
    expect(patch).toEqual({ locale: 'es' })
  })

  it('throws when Supabase fails', async () => {
    state.results = [{ data: null, error: { message: 'boom' } }]
    await expect(
      upsertSubscriber({ email: 'ana@example.com', name: '', locale: 'es', newsletter: false })
    ).rejects.toThrow('boom')
  })
})

describe('unsubscribeByToken', () => {
  beforeEach(() => {
    state.results = []
    state.calls = []
  })

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
