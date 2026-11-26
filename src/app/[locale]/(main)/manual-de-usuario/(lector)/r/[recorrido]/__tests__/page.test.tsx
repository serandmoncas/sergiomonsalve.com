import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { getManualForReader, getManual, notFound } = vi.hoisted(() => ({
  getManualForReader: vi.fn(),
  getManual: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NOTFOUND') }),
}))
vi.mock('@/lib/manual/lector', () => ({ getManualForReader }))
vi.mock('@/lib/manual/manual', () => ({ getManual }))
vi.mock('next/navigation', () => ({ notFound }))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `T:${k}` }))
vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))

import RecorridoPage from '../page'

const manual = {
  notas: new Map([['uno', { slug: 'uno', titulo: 'Nota uno' }]]),
  recorridos: new Map([['ruta', { slug: 'ruta', nombre: 'Ruta de prueba', paraQuien: 'Gente de prueba', resultado: 'Lorem resultado', pasos: ['uno', 'fantasma'] }]]),
  resolve: (r: string) => (r === 'uno' ? { tipo: 'nota', slug: 'uno' } : null),
}
const params = (recorrido: string) => Promise.resolve({ recorrido })

describe('recorrido', () => {
  beforeEach(() => { getManualForReader.mockReset(); getManual.mockReset() })

  it('sin lector: sinAcceso y no toca getManual', async () => {
    getManualForReader.mockResolvedValue({ ok: false, motivo: 'sin-acceso' })
    render(await RecorridoPage({ params: params('ruta') }))
    expect(screen.getByText('T:sinAcceso')).toBeInTheDocument()
    expect(getManual).not.toHaveBeenCalled()
  })
  it('muestra cabecera y pasos, con los sin nota apagados', async () => {
    getManualForReader.mockResolvedValue({ ok: true, manual, reader: {} })
    const { container } = render(await RecorridoPage({ params: params('ruta') }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ruta de prueba')
    expect(screen.getByText('Gente de prueba')).toBeInTheDocument()
    expect(screen.getByText('Lorem resultado')).toBeInTheDocument()
    expect(screen.getByText('Nota uno').closest('a')).toHaveAttribute('href', '/manual-de-usuario/n/uno?r=ruta')
    expect(container.querySelector('[data-por-escribir]')).toHaveTextContent('fantasma')
  })
  it('recorrido inexistente: notFound', async () => {
    getManualForReader.mockResolvedValue({ ok: true, manual, reader: {} })
    await expect(RecorridoPage({ params: params('nada') })).rejects.toThrow('NOTFOUND')
  })
})
