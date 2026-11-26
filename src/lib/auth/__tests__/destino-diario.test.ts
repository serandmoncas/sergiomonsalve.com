import { describe, it, expect } from 'vitest'
import { destinoDiario } from '../destino-diario'

describe('destinoDiario', () => {
  it('sin next va a la portada del diario', () => {
    expect(destinoDiario(null, 'es')).toBe('/es/admin/diario')
  })

  it('una página del diario se respeta, con su query', () => {
    expect(destinoDiario('/es/admin/diario/x?y=1', 'es')).toBe('/es/admin/diario/x?y=1')
    expect(destinoDiario('/es/admin/diario', 'es')).toBe('/es/admin/diario')
  })

  it.each([
    '/es/admin/comments',
    '//evil.com',
    '/\\evil.com',
    'https://evil.com/es/admin/diario',
    '/es/admin/diario/segundo-factor',
    '/es/admin/diario/segundo-factor?next=/es/admin/diario',
    '/es/admin/diariox',
    '/en/admin/diario',
  ])('%s cae en la portada del diario', (next) => {
    expect(destinoDiario(next, 'es')).toBe('/es/admin/diario')
  })
})
