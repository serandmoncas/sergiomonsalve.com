import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MesesPresencia from '../MesesPresencia'
import MapaRegiones from '../MapaRegiones'
import YoLoVi from '../YoLoVi'
import ComparadorTamano from '../ComparadorTamano'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('MesesPresencia', () => {
  it('marca el mes con más registros', () => {
    const meses = [1, 1, 1, 1, 10, 1, 1, 1, 1, 1, 1, 1]
    render(<MesesPresencia meses={meses} />)
    expect(screen.getByLabelText(/meses\.4/)).toHaveAttribute('data-maximo', 'true')
    expect(screen.getByLabelText(/meses\.0/)).toHaveAttribute('data-maximo', 'false')
  })
})

describe('MapaRegiones', () => {
  it('resalta solo las regiones presentes', () => {
    const { container } = render(<MapaRegiones regiones={['andina']} />)
    expect(container.querySelector('[data-region="andina"]')).toHaveAttribute('data-presente', 'true')
    expect(container.querySelector('[data-region="caribe"]')).toHaveAttribute('data-presente', 'false')
  })
})

describe('YoLoVi', () => {
  it('guarda y quita la especie de la lista en localStorage', () => {
    render(<YoLoVi speciesKey={42} />)
    fireEvent.click(screen.getByRole('button'))
    expect(JSON.parse(localStorage.getItem('aves:vistas')!)).toEqual([42])
    fireEvent.click(screen.getByRole('button'))
    expect(JSON.parse(localStorage.getItem('aves:vistas')!)).toEqual([])
  })

  it('funciona en memoria si localStorage falla', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    render(<YoLoVi speciesKey={42} />)
    const boton = screen.getByRole('button')
    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('ComparadorTamano', () => {
  it('compara contra la paloma cuando el ave mide 26 cm o más', () => {
    render(<ComparadorTamano tamanoCm={42} />)
    expect(screen.getByText(/referenciaPaloma/)).toBeInTheDocument()
  })

  it('compara contra la mirla cuando el ave mide menos de 26 cm', () => {
    render(<ComparadorTamano tamanoCm={18} />)
    expect(screen.getByText(/referenciaMirla/)).toBeInTheDocument()
  })
})
