import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import es from '@/messages/es.json'
import MapaTool from '../MapaTool'

function lookup(path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], es.mapa)
}

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, vars?: Record<string, string | number>) => {
      const value = String(lookup(key) ?? key)
      return vars ? value.replace(/\{(\w+)\}/g, (_, n) => String(vars[n] ?? `{${n}}`)) : value
    }
    t.raw = (key: string) => lookup(key)
    return t
  }
}))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}))

describe('MapaTool', () => {
  beforeEach(() => localStorage.clear())

  it('renders the four MAPA stations', () => {
    render(<MapaTool locale="es" />)
    const titles = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    expect(titles).toEqual(expect.arrayContaining(['Mapear', 'Aplicar', 'Practicar lo difícil', 'Ajustar']))
  })

  it('updates the plan as the person types', async () => {
    const user = userEvent.setup()
    render(<MapaTool locale="es" />)
    await user.type(screen.getByLabelText('Habilidad'), 'Excel')
    expect(screen.getByTestId('plan').textContent).toContain('Habilidad: Excel')
  })

  it('loads the example and counts key pieces', async () => {
    const user = userEvent.setup()
    render(<MapaTool locale="es" />)
    await user.click(screen.getByRole('button', { name: 'Ver un ejemplo lleno (SQL para el trabajo)' }))
    expect(screen.getByText('3 de 3 clave')).toBeInTheDocument()
    expect(screen.getByTestId('plan').textContent).toContain('★ JOIN entre tablas')
  })

  it('restores a saved draft from localStorage', () => {
    localStorage.setItem('mapa-habilidad-v1', JSON.stringify({ ...es.mapa.example, skill: 'Guardado' }))
    render(<MapaTool locale="es" />)
    expect(screen.getByLabelText('Habilidad')).toHaveValue('Guardado')
  })

  it('ignores a corrupted draft', () => {
    localStorage.setItem('mapa-habilidad-v1', '{not json')
    render(<MapaTool locale="es" />)
    expect(screen.getByLabelText('Habilidad')).toHaveValue('')
  })
})
