import { describe, it, expect } from 'vitest'
import { parsearNombreArchivo, validarDimensiones, aptaParaImpresion } from '../ingesta'

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
  it('acepta para la web un lado largo de 1024 px o más', () => {
    expect(validarDimensiones(1200, 896)).toBeNull()
    expect(validarDimensiones(768, 1024)).toBeNull()
  })

  it('rechaza imágenes de menos de 1024 px y lo explica', () => {
    expect(validarDimensiones(800, 600)).toContain('1024')
  })
})

describe('aptaParaImpresion', () => {
  it('exige 2048 px de lado largo', () => {
    expect(aptaParaImpresion(2048, 1536)).toBe(true)
    expect(aptaParaImpresion(1200, 896)).toBe(false)
  })
})
