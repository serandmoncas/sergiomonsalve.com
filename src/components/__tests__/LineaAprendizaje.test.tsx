import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LineaAprendizaje, { URL_VISOR } from '../LineaAprendizaje'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('LineaAprendizaje', () => {
  it('muestra título, intro y el visor embebido con un título accesible', () => {
    render(<LineaAprendizaje />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('title')
    expect(screen.getByText('lede')).toBeInTheDocument()
    const visor = screen.getByTitle('iframeTitle')
    expect(visor.tagName).toBe('IFRAME')
    expect(visor).toHaveAttribute('src', URL_VISOR)
    expect(visor).toHaveAttribute('loading', 'lazy')
  })

  it('ofrece abrir el visor a pantalla completa en otra pestaña', () => {
    render(<LineaAprendizaje />)
    const enlace = screen.getByRole('link', { name: /fullscreen/ })
    expect(enlace).toHaveAttribute('href', URL_VISOR)
    expect(enlace).toHaveAttribute('target', '_blank')
    expect(enlace).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('apunta al tema Aprendizaje del visor histórico', () => {
    expect(URL_VISOR).toBe('https://visor-historico.vercel.app/tema/generado/aprendizaje')
  })
})
