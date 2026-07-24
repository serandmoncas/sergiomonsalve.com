import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PendienteBadge from '../PendienteBadge'

describe('PendienteBadge', () => {
  it('renders quien and que', () => {
    render(<PendienteBadge quien="Sergio Monsalve" que="Investigar skills" estado="abierto" />)
    expect(screen.getByText('Sergio Monsalve')).toBeInTheDocument()
    expect(screen.getByText(/Investigar skills/)).toBeInTheDocument()
  })

  it('does not apply the cerrado class when estado is abierto', () => {
    const { container } = render(<PendienteBadge quien="Sergio" que="Tarea" estado="abierto" />)
    expect(container.querySelector('.pendiente')).not.toHaveClass('cerrado')
  })

  it('applies the cerrado class but keeps the text visible when estado is cerrado', () => {
    const { container } = render(<PendienteBadge quien="Sergio" que="Tarea" estado="cerrado" />)
    expect(container.querySelector('.pendiente')).toHaveClass('cerrado')
    expect(screen.getByText('Tarea', { exact: false })).toBeInTheDocument()
  })
})
