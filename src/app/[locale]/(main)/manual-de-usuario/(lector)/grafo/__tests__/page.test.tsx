import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { getManualForReader } = vi.hoisted(() => ({ getManualForReader: vi.fn() }))
vi.mock('@/lib/manual/lector', () => ({ getManualForReader }))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `T:${k}` }))
vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => `T:${k}` }))
vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children, ...r }: React.ComponentProps<'a'>) => <a href={href} {...r}>{children}</a> }))

import GrafoPage from '../page'

describe('grafo page', () => {
  beforeEach(() => getManualForReader.mockReset())

  it('sin lector: sinAcceso y ningún título de nota', async () => {
    getManualForReader.mockResolvedValue({ ok: false, motivo: 'sin-acceso' })
    const { container } = render(await GrafoPage())
    expect(screen.getByText('T:sinAcceso')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()
  })
  it('con lector: dibuja el grafo con las notas', async () => {
    const grafo = { nodes: [{ id: 'uno', titulo: 'Nota uno', existe: true }], links: [] }
    getManualForReader.mockResolvedValue({ ok: true, reader: {}, manual: { grafo, notas: new Map([['uno', { cuerpo: 'SECRETO' }]]) } })
    const { container } = render(await GrafoPage())
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getAllByLabelText('Nota uno').length).toBeGreaterThan(0)
    expect(container.innerHTML).not.toContain('SECRETO')
  })
})
