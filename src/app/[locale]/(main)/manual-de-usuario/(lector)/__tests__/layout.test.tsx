import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { getManualForReader } = vi.hoisted(() => ({ getManualForReader: vi.fn() }))
vi.mock('@/lib/manual/lector', () => ({ getManualForReader }))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `T:${k}` }))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

import LectorLayout from '../layout'

async function renderLayout() {
  render(await LectorLayout({ children: <p>contenido</p> }))
}

describe('(lector)/layout', () => {
  beforeEach(() => {
    getManualForReader.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('sin acceso: sinAcceso', async () => {
    getManualForReader.mockResolvedValue({ ok: false, motivo: 'sin-acceso' })
    await renderLayout()
    expect(screen.getByText('T:sinAcceso')).toBeInTheDocument()
    expect(screen.queryByText('contenido')).toBeNull()
  })
  it('no-configurado: noDisponible', async () => {
    getManualForReader.mockResolvedValue({ ok: false, motivo: 'manual', error: { tipo: 'no-configurado' } })
    await renderLayout()
    expect(screen.getByText('T:noDisponible')).toBeInTheDocument()
  })
  it('fallo: genérico, sin detalle', async () => {
    getManualForReader.mockResolvedValue({ ok: false, motivo: 'manual', error: { tipo: 'fallo', detalle: 'SECRETO-401' } })
    await renderLayout()
    expect(screen.getByText('T:fallo')).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('SECRETO-401')
    expect(console.error).toHaveBeenCalled()
  })
  it('ok: children y barra', async () => {
    getManualForReader.mockResolvedValue({ ok: true, manual: {}, reader: {} })
    await renderLayout()
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(screen.getByText('T:nav.mapa').closest('a')).toHaveAttribute('href', '/manual-de-usuario/mapa')
  })
})
