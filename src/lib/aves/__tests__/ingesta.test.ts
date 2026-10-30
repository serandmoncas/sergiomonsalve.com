import { describe, it, expect } from 'vitest'
import { parsearNombreArchivo, validarDimensiones } from '../ingesta'

const slugs = new Set(['azulejo-comun', 'canario-coronado'])

describe('parsearNombreArchivo', () => {
  it('separa slug y variante', () => {
    expect(parsearNombreArchivo('azulejo-comun--macho.png', slugs)).toEqual({ slug: 'azulejo-comun', variante: 'macho' })
  })

  it('acepta jpg, jpeg y webp sin importar mayúsculas', () => {
    for (const ext of ['jpg', 'JPEG', 'WebP']) {
      expect(parsearNombreArchivo(`canario-coronado--juvenil.${ext}`, slugs)).toEqual({ slug: 'canario-coronado', variante: 'juvenil' })
    }
  })

  it('rechaza un slug que no está en el catálogo', () => {
    const r = parsearNombreArchivo('pinguino--adulto.png', slugs)
    expect('error' in r && r.error).toContain('pinguino')
  })

  it('rechaza una variante desconocida', () => {
    expect(parsearNombreArchivo('azulejo-comun--adulta.png', slugs)).toHaveProperty('error')
  })

  it('rechaza un nombre sin doble guion', () => {
    expect(parsearNombreArchivo('azulejo-comun.png', slugs)).toHaveProperty('error')
  })

  it('rechaza extensiones que no son imagen', () => {
    expect(parsearNombreArchivo('azulejo-comun--adulto.gif', slugs)).toHaveProperty('error')
  })
})

describe('validarDimensiones', () => {
  it('acepta un lado largo de 2048 px', () => {
    expect(validarDimensiones(2048, 1536)).toBeNull()
    expect(validarDimensiones(1536, 2048)).toBeNull()
  })

  it('rechaza imágenes pequeñas y lo explica', () => {
    expect(validarDimensiones(1024, 768)).toContain('2048')
  })
})
