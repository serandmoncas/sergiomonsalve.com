import { describe, it, expect } from 'vitest'
import { parseNota, wikiTarget, normKey } from '../parse'

// Nota inventada: nada de texto real del manual.
const FIXTURE = `---
titulo: "Lorem ipsum dolor sit amet"
estado: brote
confianza: media
ia_capas:
  todos: redactora
  desde_aqui: entrevistadora
voces: [Ana Prueba]
fuentes:
  - "Autor Falso, Libro Inventado (2000)"
verificado: 2026-01-02
relacionados:
  - "[[Otra Nota Falsa]]"
  - "[[c]]"
terminos:
  - "[[termino-falso]]"
---

# Lorem ipsum dolor sit amet

Entrada lorem ipsum con [[a|texto]] enlazado.

## Lo que nos pasa a todos

Consectetur adipiscing elit. Ver [[B#x]].

> [!desde-aqui]- Ana Prueba
> Primera voz lorem.
>
> Segundo párrafo.

## Cómo lo han vivido y pensado otros

Sed do eiusmod tempor.

> [!desde-aqui] Beto Falso
> Segunda voz ipsum.

## Para llevarte

Ut enim ad minim veniam.

## Relacionado

- [[Otra Nota Falsa]]
- [[c]]
`

describe('parseNota', () => {
  it('lee las tres capas, llevar, entrada y metadatos', () => {
    const r = parseNota('nota-de-prueba', FIXTURE)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const n = r.nota
    expect(n.slug).toBe('nota-de-prueba')
    expect(n.titulo).toBe('Lorem ipsum dolor sit amet')
    expect(n.estado).toBe('brote')
    expect(n.confianza).toBe('media')
    expect(n.iaCapas).toEqual({ todos: 'redactora', desde_aqui: 'entrevistadora' })
    expect(n.voces).toEqual(['Ana Prueba'])
    expect(n.fuentes).toEqual(['Autor Falso, Libro Inventado (2000)'])
    expect(n.verificado).toBe('2026-01-02')
    expect(n.terminos).toEqual(['termino-falso'])
    expect(n.entrada).toContain('Entrada lorem ipsum')
    expect(n.capas.todos).toContain('Consectetur')
    expect(n.capas.todos).not.toContain('desde-aqui')
    expect(n.capas.otros).toContain('Sed do eiusmod')
    expect(n.llevar).toContain('Ut enim')
    expect(n.capas.todos).not.toContain('Relacionado')
  })

  it('extrae dos callouts desde-aqui con voces distintas, sin "> "', () => {
    const r = parseNota('x', FIXTURE)
    if (!r.ok) throw new Error('debía ser ok')
    expect(r.nota.capas.desdeAqui).toEqual([
      { voz: 'Ana Prueba', md: 'Primera voz lorem.\n\nSegundo párrafo.' },
      { voz: 'Beto Falso', md: 'Segunda voz ipsum.' },
    ])
  })

  it('acepta el alias viejo del H2 de "otros"', () => {
    const raw = `---\ntitulo: T\n---\n\n# T\n\n## Cómo lo han vivido otros\n\nLorem alias.\n`
    const r = parseNota('x', raw)
    if (!r.ok) throw new Error('debía ser ok')
    expect(r.nota.capas.otros).toBe('Lorem alias.')
  })

  it('junta wikilinks del cuerpo y de relacionados', () => {
    const r = parseNota('x', FIXTURE)
    if (!r.ok) throw new Error('debía ser ok')
    expect(r.nota.enlacesRaw).toEqual(['a', 'B', 'Otra Nota Falsa', 'c'])
    const raw = `---\ntitulo: T\nrelacionados:\n  - "[[z]]"\n---\n\n# T\n\nVer [[a|texto]] y [[B#x]].\n`
    const r2 = parseNota('x', raw)
    if (!r2.ok) throw new Error('debía ser ok')
    expect(r2.nota.enlacesRaw).toEqual(['a', 'B', 'z'])
  })

  it('toma el título del H1 si falta en el frontmatter', () => {
    const r = parseNota('x', `---\nestado: semilla\n---\n\n# Título Lorem\n\nTexto.\n`)
    if (!r.ok) throw new Error('debía ser ok')
    expect(r.nota.titulo).toBe('Título Lorem')
  })

  it('falla si falta el título', () => {
    const r = parseNota('x', `---\nestado: semilla\n---\n\nSolo texto.\n`)
    expect(r).toMatchObject({ ok: false, slug: 'x' })
  })

  it('falla con frontmatter roto', () => {
    const r = parseNota('x', `---\ntitulo: [roto\n  : :\n---\n\n# T\n`)
    expect(r).toMatchObject({ ok: false, slug: 'x' })
  })

  it('estado desconocido cae a semilla y confianza ausente a vacío', () => {
    const r = parseNota('x', `---\ntitulo: T\nestado: florecido\n---\n\n# T\n`)
    if (!r.ok) throw new Error('debía ser ok')
    expect(r.nota.estado).toBe('semilla')
    expect(r.nota.confianza).toBe('')
    expect(r.nota.verificado).toBeNull()
  })
})

describe('wikiTarget', () => {
  it('quita alias y ancla y recorta', () => {
    expect(wikiTarget(' a | texto ')).toBe('a')
    expect(wikiTarget('B#x')).toBe('B')
    expect(wikiTarget('C#x|y')).toBe('C')
    expect(wikiTarget('plano')).toBe('plano')
  })
})

describe('normKey', () => {
  it('normaliza tildes, mayúsculas, espacios y guiones', () => {
    expect(normKey('Cómo  Lo-Hacemos')).toBe('como-lo-hacemos')
  })
})

describe('H2 desconocido', () => {
  const base = (cuerpo: string) => `---\ntitulo: Prueba\n---\n\n${cuerpo}\n`

  it('conserva el encabezado y su contenido dentro de la sección vigente', () => {
    const r = parseNota('x', base('# Prueba\n\n## Lo que nos pasa a todos\n\nTexto uno.\n\n## Apartado inventado\n\nTexto dos.'))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.nota.capas.todos).toContain('Texto uno.')
    expect(r.nota.capas.todos).toContain('## Apartado inventado')
    expect(r.nota.capas.todos).toContain('Texto dos.')
  })

  it('antes de cualquier sección conocida va a la entrada', () => {
    const r = parseNota('x', base('# Prueba\n\n## Apartado inventado\n\nTexto suelto.\n\n## Para llevarte\n\nLlevar.'))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.nota.entrada).toContain('## Apartado inventado')
    expect(r.nota.entrada).toContain('Texto suelto.')
    expect(r.nota.llevar).toBe('Llevar.')
  })
})
