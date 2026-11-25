import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => `T:${k}` }))
vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children, ...r }: React.ComponentProps<'a'>) => <a href={href} {...r}>{children}</a> }))

import { Grafo } from '../Grafo'

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
})
