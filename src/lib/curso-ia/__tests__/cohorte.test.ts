import { describe, it, expect } from 'vitest'
import { COHORTE, isClosed } from '../cohorte'

describe('COHORTE', () => {
  it('has the four December sessions in order', () => {
    expect(COHORTE.sessions.map(s => s.date)).toEqual(['2026-12-09', '2026-12-10', '2026-12-14', '2026-12-15'])
  })

  it('caps the cohort at 20 seats', () => {
    expect(COHORTE.capacity).toBe(20)
  })

  it('exposes the public WhatsApp contact in one place', () => {
    expect(COHORTE.whatsapp.url).toBe('https://wa.me/573239105762')
  })
})

describe('isClosed', () => {
  it('is still open at 18:59 in Colombia on 9 Dec', () => {
    expect(isClosed(new Date('2026-12-09T23:59:00Z'))).toBe(false)
  })

  it('closes at 19:00 in Colombia on 9 Dec (midnight UTC)', () => {
    expect(isClosed(new Date('2026-12-10T00:00:00Z'))).toBe(true)
  })
})
