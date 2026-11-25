import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { requireReader, getManual, redirect } = vi.hoisted(() => ({
  requireReader: vi.fn(),
  getManual: vi.fn(),
  redirect: vi.fn((to: string) => { throw new Error(`REDIRECT:${to}`) }),
}))
vi.mock('@/lib/manual/access', () => ({ requireReader }))
vi.mock('@/lib/manual/manual', () => ({ getManual }))
vi.mock('next/navigation', () => ({ redirect }))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `T:${k}` }))
vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))

import Portada from '../page'

describe('portada', () => {
  beforeEach(() => { requireReader.mockReset(); getManual.mockReset(); redirect.mockClear() })

  it('con lector redirige al mapa y no trae el manual', async () => {
    requireReader.mockResolvedValue({ isAdmin: false })
    await expect(Portada()).rejects.toThrow('REDIRECT:/es/manual-de-usuario/mapa')
    expect(getManual).not.toHaveBeenCalled()
  })
  it('sin lector muestra sobre, Entrar y Pedir acceso', async () => {
    requireReader.mockResolvedValue(null)
    getManual.mockResolvedValue({ ok: true, manual: { sobre: 'Lorem sobre de prueba' } })
    render(await Portada())
    expect(screen.getByText('Lorem sobre de prueba')).toBeInTheDocument()
    expect(screen.getByText('T:portada.entrar').closest('a')).toHaveAttribute('href', '/manual-de-usuario/entrar')
    expect(screen.getByText('T:portada.pedirAcceso').closest('a')).toHaveAttribute('href', '/contact')
  })
  it('sobre null o manual caído: texto de respaldo', async () => {
    requireReader.mockResolvedValue(null)
    getManual.mockResolvedValue({ ok: false, error: { tipo: 'fallo', detalle: 'x' } })
    render(await Portada())
    expect(screen.getByText('T:sobreFallback')).toBeInTheDocument()
  })
})
