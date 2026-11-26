import { describe, it, expect } from 'vitest'
import { revisar } from '../guarda-diario.mjs'

const deny = ['Zacarías Inventado', 'Pueblito Falso']

describe('guarda de privacidad del diario', () => {
  it('detecta un término en una ruta del diario', () => {
    const v = revisar([{ ruta: 'src/lib/diario/x.ts', contenido: 'const a = "zacarias inventado"' }], deny)
    expect(v).toHaveLength(1)
    expect(v[0]).toMatch(/^src\/lib\/diario\/x\.ts: término n\.º 1$/)
  })

  it('revisa también el nombre del archivo', () => {
    const v = revisar([{ ruta: 'src/components/admin/diario/Pueblito Falso.tsx', contenido: '' }], deny)
    expect(v).toEqual(['src/components/admin/diario/Pueblito Falso.tsx: término n.º 2'])
  })

  it.each([
    'src/lib/diaria/tablero/x.ts',
    'src/app/[locale]/(main)/admin/diario/(protegido)/page.tsx',
    'src/app/api/admin/diario/estado/route.ts',
    'scripts/diario/comparar-hoy.ts',
  ])('cubre %s', (ruta) => {
    expect(revisar([{ ruta, contenido: 'Zacarías Inventado' }], deny)).toHaveLength(1)
  })

  it('ignora rutas fuera del diario', () => {
    expect(revisar([{ ruta: 'content/blog/es/post.mdx', contenido: 'Zacarías Inventado' }], deny)).toEqual([])
    expect(revisar([{ ruta: 'src/lib/diarios.ts', contenido: 'Zacarías Inventado' }], deny)).toEqual([])
  })

  it('no repite el término en el mensaje', () => {
    const [v] = revisar([{ ruta: 'src/lib/diario/x.ts', contenido: 'Zacarías Inventado' }], deny)
    expect(v.toLowerCase()).not.toContain('zacar')
  })

  it('NFC/NFD y mayúsculas dan igual', () => {
    const nfd = 'ZACARÍAS INVENTADO'
    expect(revisar([{ ruta: 'src/lib/diario/x.ts', contenido: nfd }], deny)).toHaveLength(1)
  })

  it('un .md del diario sin cabecera de fixture es una violación', () => {
    expect(revisar([{ ruta: 'src/lib/diario/__tests__/n.md', contenido: '# hola' }], [])).toEqual([
      'src/lib/diario/__tests__/n.md: .md sin <!-- fixture: sintética -->',
    ])
    expect(
      revisar([{ ruta: 'src/lib/diario/__tests__/n.md', contenido: '<!-- fixture: sintética -->\n# hola' }], []),
    ).toEqual([])
  })
})
