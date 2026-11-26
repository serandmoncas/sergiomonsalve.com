import { describe, it, expect } from 'vitest'
import es from '@/messages/es.json'
import en from '@/messages/en.json'

// Sergio es candidato a la maestría, no graduado (corregido por él el 26 nov 2026).
const all = (o: unknown): string[] =>
  typeof o === 'string' ? [o] : o && typeof o === 'object' ? Object.values(o).flatMap(all) : []

describe('credenciales: la maestría figura como candidatura', () => {
  it.each([['es', es], ['en', en]])('%s no afirma una maestría terminada', (_l, msgs) => {
    const texts = all(msgs)
    const claims = texts.filter(t => /\bMSc\b|maestría/i.test(t))
    expect(claims.length).toBeGreaterThan(0)
    for (const t of claims) expect(t).toMatch(/candidat/i)
  })
})
