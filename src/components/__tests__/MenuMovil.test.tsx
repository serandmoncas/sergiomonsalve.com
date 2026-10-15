import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MenuMovil, { type GrupoMenu } from '../MenuMovil'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, className, onClick }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <a href={href} className={className} onClick={onClick}>{children}</a>
  ),
  usePathname: () => '/',
}))

const grupos: GrupoMenu[] = [
  { items: [{ href: '/blog', label: 'Blog' }, { href: '/portfolio', label: 'Portfolio' }] },
  {
    titulo: 'Aprender',
    items: [
      { href: '/cursos', label: 'Cursos' },
      { href: '/aprender-a-aprender.html', label: 'Aprender a aprender', estatico: true },
    ],
  },
]
const textos = { abrir: 'Abrir menú', cerrar: 'Cerrar menú' }

describe('MenuMovil', () => {
  it('empieza cerrado: solo se ve el botón', () => {
    render(<MenuMovil grupos={grupos} textos={textos} />)
    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Blog' })).not.toBeInTheDocument()
  })

  it('al tocar el botón muestra todas las opciones, agrupadas', () => {
    render(<MenuMovil grupos={grupos} textos={textos} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog')
    expect(screen.getByText('Aprender')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Aprender a aprender' })).toHaveAttribute('href', '/aprender-a-aprender.html')
  })

  it('se cierra con Escape y al elegir una opción', () => {
    render(<MenuMovil grupos={grupos} textos={textos} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('link', { name: 'Blog' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    fireEvent.click(screen.getByRole('link', { name: 'Cursos' }))
    expect(screen.queryByRole('link', { name: 'Cursos' })).not.toBeInTheDocument()
  })
})
