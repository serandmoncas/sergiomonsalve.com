import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('server-only', () => ({}))

import NavDiario from '../NavDiario'

describe('NavDiario', () => {
  it('enlaza Objetivo (DI-087)', () => {
    render(<NavDiario locale="es" />)
    expect(screen.getByRole('link', { name: 'Objetivo' }).getAttribute('href')).toBe('/es/admin/diario/objetivo')
  })
})
