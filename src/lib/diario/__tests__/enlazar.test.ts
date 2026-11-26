import { describe, it, expect, beforeAll, vi } from 'vitest'

vi.mock('server-only', () => ({}))
import { enlazar } from '../enlazar'
import { bovedaDePrueba, CABECERA } from './ayudantes'
import type { Resolutor } from '@/lib/diaria'

let r: Resolutor
const url = (ruta: string) => `</es/admin/diario/nota?ruta=${encodeURIComponent(ruta).replace(/\(/g, '%28').replace(/\)/g, '%29')}>`

beforeAll(async () => {
  const b = await bovedaDePrueba({
    'Personas/Ana Prueba.md': CABECERA,
    'Proyectos/Faro (2026).md': CABECERA,
    'A/Duplicada.md': CABECERA,
    'B/Duplicada.md': CABECERA,
    'Diario/2026-11-25.md': CABECERA,
  }, ['Adjuntos/foto.png'])
  r = b.resolutor
})

const desde = 'Diario/2026-11-25.md'
const e = (t: string) => enlazar(t, desde, r, 'es')

describe('enlazar', () => {
  it('nota resuelta → enlace Markdown a la nota', () => {
    expect(e('Hablé con [[Ana Prueba]].')).toBe(`Hablé con [Ana Prueba](${url('Personas/Ana Prueba.md')}).`)
  })

  it('con alias muestra el alias', () => {
    expect(e('[[Ana Prueba|Ana]]')).toBe(`[Ana](${url('Personas/Ana Prueba.md')})`)
  })

  it('con sección muestra destino y sección', () => {
    expect(e('[[Ana Prueba#2026-11-25]]')).toBe(`[Ana Prueba#2026-11-25](${url('Personas/Ana Prueba.md')})`)
  })

  it('roto o ambiguo → #roto', () => {
    expect(e('[[Nadie Inventado]]')).toBe('[Nadie Inventado](#roto)')
    expect(e('[[Duplicada]]')).toBe('[Duplicada](#roto)')
  })

  it('incrustado → texto de adjunto', () => {
    expect(e('![[foto.png]]')).toBe('`adjunto: foto.png`')
  })

  it('paréntesis y signos de Markdown en el nombre quedan escapados', () => {
    expect(e('[[Faro (2026)]]')).toBe(`[Faro \\(2026\\)](${url('Proyectos/Faro (2026).md')})`)
    expect(e('[[Nadie|*negrita* _x_ \\ `c`]]')).toBe('[\\*negrita\\* \\_x\\_ \\\\ \\`c\\`](#roto)')
  })

  it('no toca enlaces dentro de código', () => {
    const t = '```\n[[Ana Prueba]]\n```\nY `[[Ana Prueba]]` en línea.'
    expect(e(t)).toBe(t)
  })

  it('un texto sin enlaces queda idéntico', () => {
    const t = '# Título\n- [ ] tarea ✅ 2026-11-25\n'
    expect(e(t)).toBe(t)
  })

  it('varios enlaces en la misma línea', () => {
    expect(e('[[Ana Prueba]] y [[Nadie]]')).toBe(`[Ana Prueba](${url('Personas/Ana Prueba.md')}) y [Nadie](#roto)`)
  })
})
