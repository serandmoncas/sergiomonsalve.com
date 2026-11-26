import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('server-only', () => ({}))

import { idNota, urlNota } from '../urls'

afterEach(() => { delete process.env.DIARIA_GITHUB_TOKEN })

describe('URLs del diario sin nombres de notas', () => {
  it('la URL de una nota no contiene su nombre ni su carpeta', () => {
    process.env.DIARIA_GITHUB_TOKEN = 'tok-1'
    const url = urlNota('es', 'Personas/Ana Prueba.md')
    expect(url).toMatch(/^\/es\/admin\/diario\/nota\?n=[0-9a-f]{20}$/)
    expect(url).not.toMatch(/Ana|Prueba|Personas/i)
  })

  it('es estable para la misma ruta y distinta entre rutas', () => {
    process.env.DIARIA_GITHUB_TOKEN = 'tok-1'
    expect(idNota('a.md')).toBe(idNota('a.md'))
    expect(idNota('a.md')).not.toBe(idNota('b.md'))
  })

  it('no es un hash adivinable: depende de una clave del servidor', () => {
    process.env.DIARIA_GITHUB_TOKEN = 'tok-1'
    const a = idNota('a.md')
    process.env.DIARIA_GITHUB_TOKEN = 'tok-2'
    expect(idNota('a.md')).not.toBe(a)
  })
})
