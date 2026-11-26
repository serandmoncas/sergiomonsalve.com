import { describe, it, expect } from 'vitest'
import { safeNext } from '../safe-next'

const FB = '/es/admin/comments'

describe('safeNext', () => {
  it('deja pasar rutas internas', () => {
    expect(safeNext('/es/manual-de-usuario/mapa', FB)).toBe('/es/manual-de-usuario/mapa')
  })
  it('conserva la query de una ruta interna', () => {
    expect(safeNext('/es/manual-de-usuario/n/x?r=y', FB)).toBe('/es/manual-de-usuario/n/x?r=y')
  })
  it.each(['//evil.com', 'https://evil.com', '/\\evil.com', 'javascript:alert(1)', 'evil.com', '', '/\nfoo'])(
    'rechaza %j', (v) => {
      expect(safeNext(v, FB)).toBe(FB)
    })
  it('null devuelve el fallback', () => {
    expect(safeNext(null, FB)).toBe(FB)
  })
})
