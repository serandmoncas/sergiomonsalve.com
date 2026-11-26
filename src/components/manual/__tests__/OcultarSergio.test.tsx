import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }))

import { OcultarSergio } from '../OcultarSergio'

const ATTR = 'data-ocultar-desde-aqui'

describe('OcultarSergio', () => {
  beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute(ATTR) })
  afterEach(() => vi.restoreAllMocks())

  it('alterna el atributo y guarda la preferencia', () => {
    render(<OcultarSergio />)
    const b = screen.getByRole('button')
    fireEvent.click(b)
    expect(document.documentElement).toHaveAttribute(ATTR)
    expect(localStorage.getItem('manual.ocultarDesdeAqui')).toBe('1')
    fireEvent.click(b)
    expect(document.documentElement).not.toHaveAttribute(ATTR)
    expect(localStorage.getItem('manual.ocultarDesdeAqui')).toBe('0')
  })
  it('restaura la preferencia guardada', () => {
    localStorage.setItem('manual.ocultarDesdeAqui', '1')
    render(<OcultarSergio />)
    expect(document.documentElement).toHaveAttribute(ATTR)
  })
  it('sobrevive a un localStorage que lanza error', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('x') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('x') })
    render(<OcultarSergio />)
    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement).toHaveAttribute(ATTR)
  })
})
