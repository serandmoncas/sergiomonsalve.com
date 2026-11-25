import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('next-intl', () => ({
  useTranslations: () => (k: string, v?: Record<string, unknown>) => (v ? `${k}:${JSON.stringify(v)}` : k),
}))

import { BarraRecorrido } from '../BarraRecorrido'
import type { Recorrido, Resolver } from '@/lib/manual/types'

const rec: Recorrido = { slug: 'ruta', nombre: 'Ruta de prueba', pasos: ['a', 'b', 'c'] }
const resolve: Resolver = (r) => ({ tipo: 'nota', slug: r })

describe('BarraRecorrido', () => {
  it('muestra Paso 2 de 3 con enlaces', () => {
    render(<BarraRecorrido recorrido={rec} slug="b" resolve={resolve} />)
    expect(screen.getByText(/"n":2,"total":3/)).toBeInTheDocument()
    expect(screen.getByText('anterior').closest('a')).toHaveAttribute('href', '/manual-de-usuario/n/a?r=ruta')
    expect(screen.getByText('siguiente').closest('a')).toHaveAttribute('href', '/manual-de-usuario/n/c?r=ruta')
    expect(screen.getByText('Ruta de prueba').closest('a')).toHaveAttribute('href', '/manual-de-usuario/r/ruta')
  })
  it('no pinta nada si la nota no está en el recorrido', () => {
    const { container } = render(<BarraRecorrido recorrido={rec} slug="z" resolve={resolve} />)
    expect(container).toBeEmptyDOMElement()
  })
})
