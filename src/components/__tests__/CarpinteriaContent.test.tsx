import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CarpinteriaContent from '../CarpinteriaContent'

const messages: Record<string, unknown> = {
  facts: ['4 sesiones de 4 horas', 'Melamina de 15 mm'],
  'course.sessions': [
    { number: '01', title: 'Herramientas, medición y cortes', text: 's1' },
    { number: '02', title: 'Diseño, despiece y pedido', text: 's2' },
    { number: '03', title: 'Perforación y ensamble', text: 's3' },
    { number: '04', title: 'Puertas, cajones y entrega', text: 's4' },
  ],
  'tools.items': [
    { title: 'Calculadora de despiece', text: 't1' },
    { title: 'Hoja de pedido', text: 't2' },
    { title: 'Página de holguras', text: 't3' },
  ],
}

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    t.raw = (key: string) => messages[key]
    return t
  },
}))

describe('CarpinteriaContent', () => {
  it('renders the four sessions in order', () => {
    render(<CarpinteriaContent />)
    const titles = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)
    expect(titles.slice(0, 4)).toEqual([
      'Herramientas, medición y cortes',
      'Diseño, despiece y pedido',
      'Perforación y ensamble',
      'Puertas, cajones y entrega',
    ])
  })

  it('renders the three tools', () => {
    render(<CarpinteriaContent />)
    expect(screen.getByText('Calculadora de despiece')).toBeInTheDocument()
    expect(screen.getByText('Hoja de pedido')).toBeInTheDocument()
    expect(screen.getByText('Página de holguras')).toBeInTheDocument()
  })

  it('links to the CarpinterIA repository in a new tab', () => {
    render(<CarpinteriaContent />)
    const repo = screen.getByRole('link', { name: 'tools.repo' })
    expect(repo).toHaveAttribute('href', 'https://github.com/serandmoncas/CarpinterIA')
    expect(repo).toHaveAttribute('target', '_blank')
  })

  it('offers WhatsApp to sign up', () => {
    render(<CarpinteriaContent />)
    expect(screen.getByRole('link', { name: 'cta.whatsapp' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/573508025988\?text=/)
  })
})
