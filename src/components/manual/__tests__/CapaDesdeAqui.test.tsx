import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('next-intl', () => ({ useTranslations: () => (k: string, v?: { voz: string }) => `${k}|${v?.voz}` }))

import { CapaDesdeAqui } from '../CapaDesdeAqui'

describe('CapaDesdeAqui', () => {
  it('cerrado por defecto y muestra la voz', () => {
    const { container } = render(<CapaDesdeAqui voz="Voz de prueba" md="Lorem ipsum" resolve={() => null} />)
    const d = container.querySelector('details[data-desde-aqui]') as HTMLDetailsElement
    expect(d).toBeInTheDocument()
    expect(d.open).toBe(false)
    expect(screen.getByText('desdeAqui|Voz de prueba')).toBeInTheDocument()
  })
})
