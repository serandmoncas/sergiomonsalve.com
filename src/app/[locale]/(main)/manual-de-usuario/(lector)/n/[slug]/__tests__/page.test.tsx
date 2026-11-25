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
vi.mock('next-intl', () => ({ useTranslations: () => (k: string, v?: Record<string, unknown>) => (v ? `${k}:${JSON.stringify(v)}` : k) }))
vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => `T:${k}` }))
vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))

import NotaPage, { generateMetadata } from '../page'

const nota = {
  slug: 'nota-de-prueba', titulo: 'Título de prueba', estado: 'semilla', confianza: 'media',
  iaCapas: {}, voces: [], fuentes: [], verificado: null, terminos: [],
  entrada: 'Lorem entrada', capas: { todos: 'Lorem para todos', otros: 'Lorem otros', desdeAqui: [{ voz: 'Voz X', md: 'Lorem aqui' }] },
  llevar: 'Lorem llevar', enlacesRaw: [],
}
const otra = { ...nota, slug: 'otra', titulo: 'Otra nota' }
const rec = { slug: 'ruta', nombre: 'Ruta de prueba', pasos: ['nota-de-prueba', 'otra'] }
const manual = {
  notas: new Map([['nota-de-prueba', nota], ['otra', otra]]),
  recorridos: new Map([['ruta', rec]]),
  resolve: (r: string) => ({ tipo: 'nota', slug: r }),
  backlinks: { 'nota-de-prueba': ['otra'] },
}
const params = (slug: string) => Promise.resolve({ slug })
const sp = (o: Record<string, string> = {}) => Promise.resolve(o)

describe('nota', () => {
  beforeEach(() => { getManualForReader.mockReset(); getManual.mockReset() })

  it('sin lector: sinAcceso y no toca getManual', async () => {
    getManualForReader.mockResolvedValue({ ok: false, motivo: 'sin-acceso' })
    render(await NotaPage({ params: params('nota-de-prueba'), searchParams: sp() }))
    expect(screen.getByText('T:sinAcceso')).toBeInTheDocument()
    expect(getManual).not.toHaveBeenCalled()
    expect(document.body.textContent).not.toContain('Título de prueba')
  })
  it('renderiza capas, llevar, backlinks y copiar', async () => {
    getManualForReader.mockResolvedValue({ ok: true, manual, reader: { isAdmin: false } })
    render(await NotaPage({ params: params('nota-de-prueba'), searchParams: sp() }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Título de prueba')
    for (const t of ['Lorem entrada', 'Lorem para todos', 'Lorem otros', 'Lorem llevar', 'Lorem aqui']) expect(screen.getByText(t)).toBeInTheDocument()
    expect(screen.getByText('Otra nota').closest('a')).toHaveAttribute('href', '/manual-de-usuario/n/otra')
    expect(screen.getByText('nota.copiarEnlace')).toBeInTheDocument()
    expect(screen.queryByText('T:nota.editar')).toBeNull()
  })
  it('admin ve Editar en GitHub', async () => {
    getManualForReader.mockResolvedValue({ ok: true, manual, reader: { isAdmin: true } })
    render(await NotaPage({ params: params('nota-de-prueba'), searchParams: sp() }))
    expect(screen.getByText('T:nota.editar').closest('a')).toHaveAttribute(
      'href', 'https://github.com/serandmoncas/manual-de-usuario/edit/main/notas/nota-de-prueba.md')
  })
  it('con ?r= muestra la barra de recorrido', async () => {
    getManualForReader.mockResolvedValue({ ok: true, manual, reader: { isAdmin: false } })
    render(await NotaPage({ params: params('nota-de-prueba'), searchParams: sp({ r: 'ruta' }) }))
    expect(screen.getByText(/"n":1,"total":2/)).toBeInTheDocument()
  })
  it('slug inexistente: notFound', async () => {
    getManualForReader.mockResolvedValue({ ok: true, manual, reader: { isAdmin: false } })
    await expect(NotaPage({ params: params('nada'), searchParams: sp() })).rejects.toThrow('NOTFOUND')
  })
  it('metadata: título solo para lectores', async () => {
    getManualForReader.mockResolvedValue({ ok: true, manual, reader: {} })
    expect((await generateMetadata({ params: params('nota-de-prueba') })).title).toBe('Título de prueba')
    getManualForReader.mockResolvedValue({ ok: false, motivo: 'sin-acceso' })
    expect((await generateMetadata({ params: params('nota-de-prueba') })).title).toBe('T:nota.tituloGenerico')
  })
})
