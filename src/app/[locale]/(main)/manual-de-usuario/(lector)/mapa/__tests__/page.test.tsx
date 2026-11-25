import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { getManualForReader, getManual } = vi.hoisted(() => ({ getManualForReader: vi.fn(), getManual: vi.fn() }))
vi.mock('@/lib/manual/lector', () => ({ getManualForReader }))
vi.mock('@/lib/manual/manual', () => ({ getManual }))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `T:${k}` }))
vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))

import MapaPage from '../page'

const manual = {
  indice: { secciones: [{ id: 's', titulo: 'Sección de prueba', entradas: [
    { n: 1, titulo: 'Con nota', confianza: 'alta', nota: 'con-nota' },
    { n: 2, titulo: 'Con ruta', confianza: 'alta', recorrido: 'ruta' },
    { n: 3, titulo: 'Sin nada', confianza: 'alta' },
    { n: 4, titulo: 'Momento', puerta: 'Puerta de prueba', confianza: 'alta', nota: 'momento' },
  ] }] },
  notas: new Map(),
}

describe('mapa', () => {
  beforeEach(() => getManualForReader.mockReset())

  it('sin lector: sinAcceso y no toca getManual', async () => {
    getManualForReader.mockResolvedValue({ ok: false, motivo: 'sin-acceso' })
    render(await MapaPage())
    expect(screen.getByText('T:sinAcceso')).toBeInTheDocument()
    expect(getManual).not.toHaveBeenCalled()
  })
  it('enlaza notas y recorridos, apaga el resto y pone la puerta primero', async () => {
    getManualForReader.mockResolvedValue({ ok: true, manual, reader: {} })
    const { container } = render(await MapaPage())
    expect(screen.getByText('Con nota').closest('a')).toHaveAttribute('href', '/manual-de-usuario/n/con-nota')
    expect(screen.getByText('Con ruta').closest('a')).toHaveAttribute('href', '/manual-de-usuario/r/ruta')
    expect(screen.getByText('Sin nada').closest('a')).toBeNull()
    expect(container.querySelector('[data-apagada]')).toHaveTextContent('Sin nada')
    const mom = screen.getByText('Puerta de prueba').closest('a')!
    expect(mom).toHaveAttribute('href', '/manual-de-usuario/n/momento')
    expect(mom.textContent!.indexOf('Puerta de prueba')).toBeLessThan(mom.textContent!.indexOf('Momento'))
  })
})
