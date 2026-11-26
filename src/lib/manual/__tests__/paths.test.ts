import { describe, it, expect } from 'vitest'
import { MANUAL_BASE, MANUAL_ES_BASE, notaHref, recorridoHref, mapaHref, grafoHref } from '../paths'

describe('paths del manual', () => {
  it('bases', () => {
    expect(MANUAL_BASE).toBe('/manual-de-usuario')
    expect(MANUAL_ES_BASE).toBe('/es/manual-de-usuario')
  })
  it('hrefs sin locale', () => {
    expect(notaHref('nota-de-prueba')).toBe('/manual-de-usuario/n/nota-de-prueba')
    expect(notaHref('nota-de-prueba', 'rec')).toBe('/manual-de-usuario/n/nota-de-prueba?r=rec')
    expect(recorridoHref('rec')).toBe('/manual-de-usuario/r/rec')
    expect(mapaHref()).toBe('/manual-de-usuario/mapa')
    expect(grafoHref()).toBe('/manual-de-usuario/grafo')
  })
})
