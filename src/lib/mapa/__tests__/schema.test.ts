import { describe, it, expect } from 'vitest'
import es from '@/messages/es.json'
import { planRequestSchema, isHoneypotFilled } from '../schema'

const data = es.mapa.example
const valid = { email: 'ana@example.com', name: 'Ana', locale: 'es', newsletter: false, data }

describe('planRequestSchema', () => {
  it('accepts a valid request with the example data', () => {
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
    ['unknown locale', { locale: 'fr' }],
    ['newsletter as string', { newsletter: 'true' }],
    ['name too long', { name: 'x'.repeat(81) }],
    ['free-text plan instead of data', { data: undefined, plan: 'Click here' }],
    ['skill too long', { data: { ...data, skill: 'x'.repeat(201) } }],
    ['recall too long', { data: { ...data, recall: 'x'.repeat(601) } }],
    ['hours outside the options', { data: { ...data, hours: '99' } }],
    ['too many pieces', { data: { ...data, pieces: Array.from({ length: 16 }, () => ({ text: 'a', key: false })) } }],
    ['a link in a field', { data: { ...data, project: 'Gana dinero en https://evil.example' } }],
    ['a www address', { data: { ...data, skill: 'visita www.spam.co' } }],
    ['a bare domain', { data: { ...data, pieces: [{ text: 'premios en ganador.com', key: true }] } }],
    ['a link in the name', { name: 'http://x' }]
  ])('rejects %s', (_label, patch) => {
    expect(planRequestSchema.safeParse({ ...valid, ...patch }).success).toBe(false)
  })

  it.each(['Next.js y Node.js', 'ASP.NET Core', 'Socket.io', 'Vue.app', 'Aprender inglés.Me gustó'])(
    'accepts technical words and text with dots that are not links: %s',
    skill => {
      expect(planRequestSchema.safeParse({ ...valid, data: { ...data, skill } }).success).toBe(true)
    }
  )

  it.each(['evil.shop/login', 'bit.do/x', 'visita ganador.com', 'entra a premio.co ya', 'ftp://x'])(
    'rejects link-like text: %s',
    skill => {
      expect(planRequestSchema.safeParse({ ...valid, data: { ...data, skill } }).success).toBe(false)
    }
  )
})

describe('isHoneypotFilled', () => {
  it('detects a filled website field', () => {
    expect(isHoneypotFilled({ website: 'http://spam' })).toBe(true)
    expect(isHoneypotFilled({ website: '' })).toBe(false)
    expect(isHoneypotFilled({})).toBe(false)
    expect(isHoneypotFilled(null)).toBe(false)
  })
})
