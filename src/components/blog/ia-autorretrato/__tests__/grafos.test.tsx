import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'
import RedCoautoria, { lineas } from '../RedCoautoria'
import MapaDiscurso from '../MapaDiscurso'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'en' }))

describe('RedCoautoria', () => {
  it('dibuja un panel por era con sus nodos y aristas', () => {
    const { container } = render(<RedCoautoria datos={EJEMPLO} />)
    expect(container.querySelectorAll('[data-era]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-era="smonsalve"] [data-nodo]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-era="serandmoncas"] line')).toHaveLength(2)
    expect(screen.getAllByText('Persona 1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Claude Opus 5.5').length).toBeGreaterThan(0)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('titula cada panel con el rango de años de los datos', () => {
    render(<RedCoautoria datos={EJEMPLO} />)
    for (const e of EJEMPLO.eras) {
      const rango = e.desde.slice(0, 4) === e.hasta.slice(0, 4) ? e.desde.slice(0, 4) : `${e.desde.slice(0, 4)}–${e.hasta.slice(0, 4)}`
      expect(screen.getByText(`${e.cuenta} · ${rango}`)).toBeTruthy()
    }
  })

  it('no rompe sin nodos', () => {
    const vacio = { ...EJEMPLO, grafoCoautoria: EJEMPLO.grafoCoautoria.map(g => ({ ...g, nodos: [], aristas: [] })) }
    const { container } = render(<RedCoautoria datos={vacio} />)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })
})

describe('MapaDiscurso', () => {
  it('resalta conceptos de mis prompts y usa la etiqueta del idioma', () => {
    const { container } = render(<MapaDiscurso datos={EJEMPLO} />)
    expect(container.querySelector('[data-nodo="vibe-coding"]')!.getAttribute('data-resaltado')).toBe('true')
    expect(screen.getAllByText('agentic engineering').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('line')).toHaveLength(1)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('mantiene los textos del SVG legibles (>= 11px a 328px)', () => {
    const { container } = render(<MapaDiscurso datos={EJEMPLO} />)
    const svg = container.querySelector('svg')!
    const ancho = Number(svg.getAttribute('viewBox')!.split(' ')[2])
    for (const t of container.querySelectorAll('svg text')) {
      expect((Number(t.getAttribute('font-size')) * 328) / ancho).toBeGreaterThanOrEqual(11)
    }
  })
})

describe('lineas', () => {
  it('parte en el primer espacio las etiquetas largas', () => {
    expect(lineas('Claude Sonnet 4.6')).toEqual(['Claude', 'Sonnet 4.6'])
  })
  it('deja intactas las cortas o sin espacio', () => {
    expect(lineas('Sergio')).toEqual(['Sergio'])
    expect(lineas('Claude Opus')).toEqual(['Claude Opus'])
    expect(lineas('abcdefghijklmnop')).toEqual(['abcdefghijklmnop'])
  })
})
