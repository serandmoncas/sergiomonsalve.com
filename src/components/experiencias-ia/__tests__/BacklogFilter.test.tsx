import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BacklogFilter from '../BacklogFilter'
import type { BacklogItem } from '@/lib/experiencias-ia/data'

const items: BacklogItem[] = [
  { titulo: 'Tema alta', proponente: 'Sergio', prioridad: 'alta', nota: 'nota alta' },
  { titulo: 'Tema media', proponente: 'Jorge', prioridad: 'media', nota: 'nota media' },
  { titulo: 'Tema baja', proponente: 'Diego', prioridad: 'baja', nota: 'nota baja' },
]

describe('BacklogFilter', () => {
  it('renders all items by default', () => {
    render(<BacklogFilter items={items} />)
    expect(screen.getByText('Tema alta')).toBeInTheDocument()
    expect(screen.getByText('Tema media')).toBeInTheDocument()
    expect(screen.getByText('Tema baja')).toBeInTheDocument()
  })

  it('filters to only alta priority items when Alta is clicked', () => {
    render(<BacklogFilter items={items} />)
    fireEvent.click(screen.getByText('Alta'))
    expect(screen.getByText('Tema alta')).toBeInTheDocument()
    expect(screen.queryByText('Tema media')).not.toBeInTheDocument()
    expect(screen.queryByText('Tema baja')).not.toBeInTheDocument()
  })

  it('shows all items again when Todas is clicked after filtering', () => {
    render(<BacklogFilter items={items} />)
    fireEvent.click(screen.getByText('Media'))
    fireEvent.click(screen.getByText('Todas'))
    expect(screen.getByText('Tema alta')).toBeInTheDocument()
    expect(screen.getByText('Tema media')).toBeInTheDocument()
    expect(screen.getByText('Tema baja')).toBeInTheDocument()
  })
})
