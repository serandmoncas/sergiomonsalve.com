import { describe, it, expect } from 'vitest'
import { planRequestSchema, isHoneypotFilled } from '../schema'

const valid = { email: 'ana@example.com', name: 'Ana', locale: 'es', plan: 'PLAN MAPA', newsletter: false }

describe('planRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(planRequestSchema.safeParse(valid).success).toBe(true)
  })

  it('normalizes email casing and spaces', () => {
    const r = planRequestSchema.parse({ ...valid, email: '  Ana@Example.COM ' })
    expect(r.email).toBe('ana@example.com')
  })

  it('defaults name to empty string and trims it', () => {
    expect(planRequestSchema.parse({ ...valid, name: undefined }).name).toBe('')
    expect(planRequestSchema.parse({ ...valid, name: '  Ana ' }).name).toBe('Ana')
  })

  it.each([
    ['bad email', { email: 'nope' }],
    ['empty plan', { plan: '' }],
    ['plan too long', { plan: 'x'.repeat(6001) }],
    ['unknown locale', { locale: 'fr' }],
    ['newsletter as string', { newsletter: 'true' }],
    ['name too long', { name: 'x'.repeat(81) }]
  ])('rejects %s', (_label, patch) => {
    expect(planRequestSchema.safeParse({ ...valid, ...patch }).success).toBe(false)
  })
})

describe('isHoneypotFilled', () => {
  it('detects a filled website field', () => {
    expect(isHoneypotFilled({ website: 'http://spam' })).toBe(true)
    expect(isHoneypotFilled({ website: '' })).toBe(false)
    expect(isHoneypotFilled({})).toBe(false)
    expect(isHoneypotFilled(null)).toBe(false)
  })
})
