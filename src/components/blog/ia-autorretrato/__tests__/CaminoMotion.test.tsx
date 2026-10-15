import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'
import CaminoMotion from '../CaminoMotion'

const CAMINO = EJEMPLO.camino

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))

const conMovimientoReducido = (reducido: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reducido, addEventListener: vi.fn(), removeEventListener: vi.fn() })
}
// rAF controlable: los cuadros solo avanzan cuando el test llama a `cuadro(ms)`.
let cola = new Map<number, FrameRequestCallback>()
let idSig = 0
const cuadro = (ms: number) => {
  const [id, cb] = [...cola.entries()][0] ?? []
  if (id === undefined || !cb) return
  cola.delete(id)
  act(() => cb(ms))
}
const valor = () => Number((screen.getByRole('slider', { name: 'tiempo' }) as HTMLInputElement).value)
// IntersectionObserver controlable: `visible(ratio)` simula el cruce del umbral.
let observadores: { cb: IntersectionObserverCallback; el: Element | null; desconectado: boolean }[] = []
const visible = (ratio: number) => act(() => {
  for (const o of observadores) if (!o.desconectado) o.cb([{ isIntersecting: ratio > 0, intersectionRatio: ratio, target: o.el! } as IntersectionObserverEntry], {} as IntersectionObserver)
})
const conObservador = () => {
  vi.stubGlobal('IntersectionObserver', class {
    o: (typeof observadores)[number]
    constructor(cb: IntersectionObserverCallback) { this.o = { cb, el: null, desconectado: false }; observadores.push(this.o) }
    observe(el: Element) { this.o.el = el }
    disconnect() { this.o.desconectado = true }
    unobserve() {}
  })
}
beforeEach(() => {
  observadores = []
  cola = new Map(); idSig = 0
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { cola.set(++idSig, cb); return idSig })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => { cola.delete(id) })
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('CaminoMotion', () => {
  it('arranca en t=0 mostrando solo lo de hoy', () => {
    conMovimientoReducido(false)
    const { container } = render(<CaminoMotion camino={CAMINO} />)
    expect(container.querySelector('[data-nodo="fastapi"]')!.getAttribute('opacity')).toBe('0')
    expect(container.querySelector('[data-nodo="logica"]')!.getAttribute('opacity')).toBe('0')
  })
  it('arrastrar la línea de tiempo al final muestra todo', () => {
    conMovimientoReducido(false)
    const { container } = render(<CaminoMotion camino={CAMINO} />)
    fireEvent.change(screen.getByRole('slider', { name: 'tiempo' }), { target: { value: '50' } })
    for (const id of ['logica', 'python', 'fastapi']) expect(container.querySelector(`[data-nodo="${id}"]`)!.getAttribute('opacity')).toBe('1')
  })
  it('con movimiento reducido arranca en el estado final y en pausa', () => {
    conMovimientoReducido(true)
    const { container } = render(<CaminoMotion camino={CAMINO} />)
    expect(container.querySelector('[data-nodo="logica"]')!.getAttribute('opacity')).toBe('1')
    expect(screen.getByRole('button', { name: 'play' })).toBeInTheDocument()
  })
  it('etiqueta solo los nodos de hoy al inicio, y los de la tabla son todos', () => {
    conMovimientoReducido(false)
    const { container } = render(<CaminoMotion camino={CAMINO} />)
    expect(container.querySelector('svg')!.getAttribute('role')).toBe('img')
    expect(container.querySelector('[data-nodo="logica"] text')).toBeNull()
    expect(container.querySelector('[data-nodo="fastapi"] text')).not.toBeNull()
  })
  it('tiene descripción accesible y tabla de datos', () => {
    conMovimientoReducido(false)
    render(<CaminoMotion camino={CAMINO} />)
    expect(screen.getByRole('img', { name: 'resumen' })).toBeInTheDocument()
    expect(screen.getAllByText('FastAPI').length).toBeGreaterThan(0)
  })
  it('el año inicial es el máximo, no "raices"', () => {
    conMovimientoReducido(false)
    render(<CaminoMotion camino={CAMINO} />)
    expect(screen.queryByText('raices', { selector: 'text' })).toBeNull()
    expect(screen.getByText('2025', { selector: 'text' })).toBeInTheDocument()
  })
  it('etiqueta de nodos a la derecha va anclada al final', () => {
    conMovimientoReducido(false)
    const { container } = render(<CaminoMotion camino={CAMINO} />)
    expect(container.querySelector('[data-nodo="fastapi"] text')!.getAttribute('text-anchor')).toBe('end')
  })
  describe('autoplay por visibilidad', () => {
    it('no arranca al montar, solo al estar ≥ 50 % visible', () => {
      conMovimientoReducido(false)
      conObservador()
      render(<CaminoMotion camino={CAMINO} />)
      expect(cola.size).toBe(0)
      expect(screen.getByRole('button', { name: 'play' })).toBeInTheDocument()
      visible(0.3)
      expect(cola.size).toBe(0)
      visible(0.6)
      expect(cola.size).toBe(1)
      expect(screen.getByRole('button', { name: 'pausa' })).toBeInTheDocument()
    })
    it('se pausa al salir del viewport y reanuda al volver', () => {
      conMovimientoReducido(false)
      conObservador()
      render(<CaminoMotion camino={CAMINO} />)
      visible(1); cuadro(0); cuadro(1000)
      visible(0)
      expect(cola.size).toBe(0)
      expect(valor()).toBeCloseTo(1, 1)
      visible(1)
      expect(cola.size).toBe(1)
    })
    it('si el usuario pausó, volver a la vista no reanuda', () => {
      conMovimientoReducido(false)
      conObservador()
      render(<CaminoMotion camino={CAMINO} />)
      visible(1)
      fireEvent.click(screen.getByRole('button', { name: 'pausa' }))
      visible(0); visible(1)
      expect(cola.size).toBe(0)
    })
    it('sin IntersectionObserver no hay autoplay, pero el botón funciona', () => {
      conMovimientoReducido(false)
      vi.stubGlobal('IntersectionObserver', undefined)
      render(<CaminoMotion camino={CAMINO} />)
      expect(cola.size).toBe(0)
      fireEvent.click(screen.getByRole('button', { name: 'play' }))
      expect(cola.size).toBe(1)
    })
    it('con movimiento reducido no observa ni reproduce', () => {
      conMovimientoReducido(true)
      conObservador()
      render(<CaminoMotion camino={CAMINO} />)
      expect(observadores).toHaveLength(0)
      expect(cola.size).toBe(0)
    })
  })
  describe('accesibilidad', () => {
    it('ningún elemento enfocable queda dentro de [role=img]', () => {
      conMovimientoReducido(false)
      const { container } = render(<CaminoMotion camino={CAMINO} />)
      const img = container.querySelector('[role="img"]')!
      expect(img.querySelector('[tabindex],button,input,a[href]')).toBeNull()
      expect(screen.getByRole('region', { name: 'desplazar' })).toBeInTheDocument()
    })
    it('el control deslizante tiene aria-valuetext con año y fase', () => {
      conMovimientoReducido(false)
      render(<CaminoMotion camino={CAMINO} />)
      expect(screen.getByRole('slider', { name: 'tiempo' }).getAttribute('aria-valuetext')).toBe('2025 · fases.presente')
    })
  })
  describe('bucle de animación', () => {
    it('play avanza, pausa detiene', () => {
      conMovimientoReducido(false)
      conObservador()
      render(<CaminoMotion camino={CAMINO} />)
      visible(1)
      cuadro(0); cuadro(2000)
      expect(valor()).toBeCloseTo(2, 1)
      fireEvent.click(screen.getByRole('button', { name: 'pausa' }))
      expect(cola.size).toBe(0)
      expect(valor()).toBeCloseTo(2, 1)
      expect(screen.getByRole('button', { name: 'play' })).toBeInTheDocument()
    })
    it('al llegar al final se detiene y play reinicia desde 0', () => {
      conMovimientoReducido(false)
      conObservador()
      render(<CaminoMotion camino={CAMINO} />)
      visible(1)
      cuadro(0); cuadro(999999)
      expect(valor()).toBe(50)
      expect(cola.size).toBe(0)
      fireEvent.click(screen.getByRole('button', { name: 'play' }))
      expect(valor()).toBe(0)
      cuadro(0); cuadro(1000)
      expect(valor()).toBeCloseTo(1, 1)
    })
  })
  it('todo el texto del SVG mide ≥ 11 px con minWidth 600', () => {
    conMovimientoReducido(true)
    const { container } = render(<CaminoMotion camino={CAMINO} />)
    const textos = [...container.querySelectorAll('svg text')]
    expect(textos.length).toBeGreaterThan(0)
    for (const x of textos) expect(Number(x.getAttribute('font-size')) * 600 / 960).toBeGreaterThanOrEqual(11)
  })
})
