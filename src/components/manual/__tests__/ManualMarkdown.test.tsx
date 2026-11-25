import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))
vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }))

import { ManualMarkdown } from '../ManualMarkdown'
import type { Resolver } from '@/lib/manual/types'

const resolve: Resolver = (raw) =>
  raw === 'Nota de prueba' ? { tipo: 'nota', slug: 'nota-de-prueba' }
  : raw === 'Ruta de prueba' ? { tipo: 'recorrido', slug: 'ruta-de-prueba' }
  : null

describe('ManualMarkdown', () => {
  it('wikilink resuelto: link a la nota con su alias', () => {
    render(<ManualMarkdown md="Lorem [[Nota de prueba|ver esto]] ipsum" resolve={resolve} />)
    expect(screen.getByText('ver esto').closest('a')).toHaveAttribute('href', '/manual-de-usuario/n/nota-de-prueba')
  })
  it('wikilink sin alias usa el destino como texto', () => {
    render(<ManualMarkdown md="[[Nota de prueba]]" resolve={resolve} />)
    expect(screen.getByText('Nota de prueba').closest('a')).toBeInTheDocument()
  })
  it('wikilink a un recorrido', () => {
    render(<ManualMarkdown md="[[Ruta de prueba]]" resolve={resolve} />)
    expect(screen.getByText('Ruta de prueba').closest('a')).toHaveAttribute('href', '/manual-de-usuario/r/ruta-de-prueba')
  })
  it('wikilink no resuelto: span data-por-escribir', () => {
    const { container } = render(<ManualMarkdown md="[[Fantasma|algo]]" resolve={resolve} />)
    const s = container.querySelector('span[data-por-escribir]')
    expect(s).toHaveTextContent('algo')
    expect(container.querySelector('a')).toBeNull()
  })
  it('[VERIFICAR: x] es un mark con title', () => {
    const { container } = render(<ManualMarkdown md="Lorem [VERIFICAR: la cifra] ipsum" resolve={resolve} />)
    const m = container.querySelector('mark[data-verificar]')
    expect(m).toHaveTextContent('por verificar')
    expect(m).toHaveAttribute('title', 'la cifra')
  })
  it('[VERIFICAR] sin detalle', () => {
    const { container } = render(<ManualMarkdown md="Lorem [VERIFICAR] ipsum" resolve={resolve} />)
    expect(container.querySelector('mark[data-verificar]')).toHaveTextContent('por verificar')
  })
  it('un script se muestra como texto, no como elemento', () => {
    const { container } = render(<ManualMarkdown md={'Lorem <script>alert(1)</script> ipsum'} resolve={resolve} />)
    expect(container.querySelector('script')).toBeNull()
  })
  it('html crudo no crea elementos', () => {
    const { container } = render(<ManualMarkdown md={'<img src=x onerror=alert(1)>\n\n<b>negra</b>'} resolve={resolve} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('b')).toBeNull()
  })
  it('un javascript: en un link normal se neutraliza', () => {
    const { container } = render(<ManualMarkdown md="[x](javascript:alert(1))" resolve={resolve} />)
    expect(container.querySelector('a')?.getAttribute('href') ?? '').not.toContain('javascript')
  })
  it('links externos normales se conservan', () => {
    render(<ManualMarkdown md="[ext](https://example.com)" resolve={resolve} />)
    expect(screen.getByText('ext').closest('a')).toHaveAttribute('href', 'https://example.com')
  })
  it('agrega ?r= en contexto de recorrido', () => {
    render(<ManualMarkdown md="[[Nota de prueba]]" resolve={resolve} recorrido="ruta-de-prueba" />)
    expect(screen.getByText('Nota de prueba').closest('a')).toHaveAttribute('href', '/manual-de-usuario/n/nota-de-prueba?r=ruta-de-prueba')
  })
})
