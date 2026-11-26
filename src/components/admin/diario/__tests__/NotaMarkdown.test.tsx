import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import NotaMarkdown from '../NotaMarkdown'

const pintar = (md: string) => render(<NotaMarkdown markdown={md} />).container

describe('NotaMarkdown', () => {
  it('<script> no crea un script', () => {
    const c = pintar('Hola <script>alert(1)</script>')
    expect(c.querySelector('script')).toBeNull()
  })

  it('<img onerror> no crea una imagen con onerror', () => {
    const c = pintar('<img src=x onerror="alert(1)">')
    expect(c.querySelector('img[onerror]')).toBeNull()
  })

  it('[x](javascript:…) no deja un href javascript:', () => {
    const c = pintar('[x](javascript:alert(1))')
    for (const a of c.querySelectorAll('a')) expect(a.getAttribute('href') ?? '').not.toMatch(/^\s*javascript:/i)
  })

  it('las casillas se ven marcadas y no se pueden tocar', () => {
    const c = pintar('- [x] hecha\n- [ ] pendiente\n')
    const cajas = c.querySelectorAll('input[type=checkbox]')
    expect(cajas).toHaveLength(2)
    expect((cajas[0] as HTMLInputElement).checked).toBe(true)
    expect([...cajas].every(x => (x as HTMLInputElement).disabled)).toBe(true)
  })

  it('#roto se pinta como enlace roto, sin href', () => {
    const c = pintar('[Nadie](#roto)')
    const roto = c.querySelector('span.roto')!
    expect(roto.textContent).toBe('Nadie')
    expect(roto.getAttribute('title')).toBe('Nota que no existe')
    expect(c.querySelector('a')).toBeNull()
  })

  it('un enlace interno es un enlace normal', () => {
    const c = pintar('[Ana](</es/admin/diario/nota?ruta=Personas%2FAna.md>)')
    expect(c.querySelector('a')!.getAttribute('href')).toBe('/es/admin/diario/nota?ruta=Personas%2FAna.md')
  })

  it('un enlace externo abre aparte sin referer', () => {
    const a = pintar('[web](https://example.com)').querySelector('a')!
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
    expect(a.getAttribute('target')).toBe('_blank')
  })

  it('una imagen Markdown externa no se carga: se muestra como texto', () => {
    const c = pintar('![pixel](https://rastreo.example/p.gif?u=1)')
    expect(c.querySelector('img')).toBeNull()
    expect(c.textContent).toContain('imagen: pixel')
    expect(c.innerHTML).not.toContain('rastreo.example')
  })

  it('un bloque dataview se ve como código', () => {
    const c = pintar('```dataview\nTABLE x\n```')
    expect(c.querySelector('pre code')!.textContent).toContain('TABLE x')
  })
})
