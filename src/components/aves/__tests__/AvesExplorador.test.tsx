import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AvesExplorador from '../AvesExplorador'
import { especie } from '@/lib/aves/__tests__/especie-de-prueba'

const idioma = vi.hoisted(() => ({ actual: 'es' }))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => idioma.actual }))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

const especies = [
  especie('sirir', { nombreEs: 'Sirirí común', familia: 'Tyrannidae', puestoColombia: 1 }, { colores: ['amarillo'] }),
  especie('azulejo', { nombreEs: 'Azulejo común', familia: 'Thraupidae', puestoColombia: 2 }, { colores: ['azul'] }),
  especie('tangara', { nombreEs: 'Tángara dorada', familia: 'Thraupidae', puestoColombia: 3 }, { colores: ['amarillo'] }),
  especie('gallinazo', { nombreEs: 'Gallinazo negro', familia: 'Cathartidae', puestoColombia: 4 }, { tamanoCm: 64, claseTamano: 'gallinazo', colores: ['negro'] }),
]

const tarjetas = () => screen.getAllByRole('link')

describe('AvesExplorador', () => {
  it('en inglés muestra el nombre en inglés en las tarjetas', () => {
    idioma.actual = 'en'
    render(<AvesExplorador especies={[especie('x', { nombreEs: 'Sirirí común', nombreEn: 'Tropical Kingbird' })]} />)
    idioma.actual = 'es'
    expect(screen.getByText('Tropical Kingbird')).toBeInTheDocument()
    expect(screen.queryByText('Sirirí común')).not.toBeInTheDocument()
  })

  it('muestra una tarjeta por especie', () => {
    render(<AvesExplorador especies={especies} />)
    expect(tarjetas()).toHaveLength(4)
  })

  it('filtra al escribir en el buscador', () => {
    render(<AvesExplorador especies={especies} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'tangara' } })
    expect(tarjetas()).toHaveLength(1)
  })

  it('reduce la lista con el filtro de tamaño', () => {
    render(<AvesExplorador especies={especies} />)
    fireEvent.click(screen.getByRole('button', { name: 'tamano.gallinazo' }))
    expect(tarjetas()).toHaveLength(1)
  })

  it('sin resultados muestra un mensaje y un botón para limpiar filtros', () => {
    render(<AvesExplorador especies={especies} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'pingüino' } })
    expect(screen.getByText('sinResultados')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'limpiarFiltros' }))
    expect(tarjetas()).toHaveLength(4)
  })

  it('agrupa por familia', () => {
    render(<AvesExplorador especies={especies} />)
    fireEvent.click(screen.getByRole('button', { name: 'vistaFamilia' }))
    expect(screen.getByRole('heading', { name: /Thraupidae/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Cathartidae/ })).toBeInTheDocument()
  })
})
