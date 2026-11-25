import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { stop } = vi.hoisted(() => ({ stop: vi.fn() }))
vi.mock('d3-force', async (orig) => {
  const real = await orig<typeof import('d3-force')>()
  return {
    ...real,
    forceSimulation: ((...a: Parameters<typeof real.forceSimulation>) => {
      const sim = real.forceSimulation(...a)
      const o = sim.stop.bind(sim)
      sim.stop = () => { stop(); return o() }
      return sim
    }) as typeof real.forceSimulation,
  }
})
vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => `T:${k}` }))
vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children, ...r }: React.ComponentProps<'a'>) => <a href={href} {...r}>{children}</a> }))

import { Grafo } from '../Grafo'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

const grafo = {
  nodes: [
    { id: 'uno', titulo: 'Nota uno', existe: true },
    { id: 'dos', titulo: 'Nota dos', existe: true },
    { id: 'x:fantasma', titulo: 'Fantasma', existe: false },
  ],
  links: [
    { source: 'uno', target: 'dos' },
    { source: 'uno', target: 'x:fantasma' },
  ],
}

describe('Grafo', () => {
  it('un enlace por nota existente con su href y aria-label con el título', () => {
    const { container } = render(<Grafo grafo={grafo} />)
    const svg = container.querySelector('svg')!
    const enlaces = Array.from(svg.querySelectorAll('a'))
    expect(enlaces).toHaveLength(2)
    expect(screen.getAllByLabelText('Nota uno').some((e) => e.getAttribute('href') === '/manual-de-usuario/n/uno')).toBe(true)
    expect(screen.getAllByLabelText('Nota dos').some((e) => e.getAttribute('href') === '/manual-de-usuario/n/dos')).toBe(true)
  })
  it('los nodos inexistentes no son enlaces', () => {
    const { container } = render(<Grafo grafo={grafo} />)
    expect(container.querySelectorAll('a[href*="fantasma"]')).toHaveLength(0)
    const fantasma = container.querySelector('[data-fantasma]')!
    expect(fantasma.closest('a')).toBeNull()
    expect(fantasma).toHaveTextContent('Fantasma')
  })
  it('SVG con role img y lista oculta de notas existentes para teclado y lectores', () => {
    const { container } = render(<Grafo grafo={grafo} />)
    expect(container.querySelector('svg')).toHaveAttribute('role', 'img')
    const lista = container.querySelector('ul.sr-only')!
    const items = Array.from(lista.querySelectorAll('a'))
    expect(items.map((a) => a.getAttribute('href'))).toEqual(['/manual-de-usuario/n/uno', '/manual-de-usuario/n/dos'])
  })
  it('marca el nodo actual', () => {
    const { container } = render(<Grafo grafo={grafo} actual="dos" />)
    const marcados = container.querySelectorAll('[data-actual]')
    expect(marcados).toHaveLength(1)
    expect(marcados[0].closest('a')).toHaveAttribute('href', '/manual-de-usuario/n/dos')
  })
  it('modo compacto cambia el alto', () => {
    const { container } = render(<Grafo grafo={grafo} compacto />)
    expect(container.querySelector('[data-compacto]')).not.toBeNull()
  })
  it('los enlaces del SVG salen del orden de tabulación; la lista oculta es el camino de teclado', () => {
    const { container } = render(<Grafo grafo={grafo} />)
    container.querySelectorAll('svg a').forEach((a) => expect(a).toHaveAttribute('tabindex', '-1'))
    expect(container.querySelector('svg')!.getAttribute('class')).not.toContain('touch-none')
  })
  it('el nodo actual lleva touch-none, no el SVG entero', () => {
    const { container } = render(<Grafo grafo={grafo} actual="uno" />)
    expect(container.querySelector('[data-actual]')!.closest('g')!.getAttribute('class')).toContain('touch-none')
  })
  it('las posiciones quedan dentro del recuadro', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { container } = render(<Grafo grafo={grafo} />)
    container.querySelectorAll('svg circle').forEach((c) => {
      const x = Number(c.getAttribute('cx')); const y = Number(c.getAttribute('cy'))
      expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(600)
      expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(460)
    })
  })
  it('reduced-motion: no anima (sin listener de tick) y el arrastre mueve el nodo con tick()', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { container } = render(<Grafo grafo={grafo} actual="uno" />)
    const circulo = () => container.querySelector('[data-actual]')!
    const antes = circulo().getAttribute('cx')
    const g = circulo().closest('g')!
    const svg = container.querySelector('svg')!
    svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 600, height: 460 }) as DOMRect
    fireEvent.pointerDown(g, { pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(svg, { pointerId: 1, clientX: 40, clientY: 40 })
    expect(circulo().getAttribute('cx')).not.toBe(antes)
    fireEvent.pointerUp(svg)
  })
  it('al desmontar se detiene la simulación', () => {
    const { unmount } = render(<Grafo grafo={grafo} />)
    stop.mockClear()
    unmount()
    expect(stop).toHaveBeenCalled()
  })
})
