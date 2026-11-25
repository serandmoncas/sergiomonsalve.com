import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }))

import { NotaMeta } from '../NotaMeta'
import type { Nota } from '@/lib/manual/types'

const nota = {
  slug: 'n', titulo: 'T', estado: 'brote', confianza: 'media',
  iaCapas: { todos: 'Lorem ia' }, voces: [], fuentes: ['Fuente de prueba'], verificado: null,
  terminos: ['término uno'], entrada: '', capas: {}, enlacesRaw: [],
} as Nota

describe('NotaMeta', () => {
  it('muestra estado, confianza, IA y fuentes en details', () => {
    const { container } = render(<NotaMeta nota={nota} />)
    expect(screen.getByText('término uno').closest('a')).toBeNull()
    expect(screen.getByText('término uno')).toBeInTheDocument()
    expect(screen.getByText('brote')).toBeInTheDocument()
    expect(screen.getByText('media')).toBeInTheDocument()
    expect(screen.getByText('Lorem ia')).toBeInTheDocument()
    expect(container.querySelector('details')).toHaveTextContent('Fuente de prueba')
  })
})
