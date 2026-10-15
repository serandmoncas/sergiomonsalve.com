import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { EJEMPLO } from '@/lib/ia-autorretrato/ejemplo'
import MatrizEcosistema from '../MatrizEcosistema'
import CuadranteConceptos from '../CuadranteConceptos'
import PerfilPrompts from '../PerfilPrompts'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))

describe('MatrizEcosistema', () => {
  it('marca cada herramienta como medida o declarada y usa el uso del idioma', () => {
    render(<MatrizEcosistema datos={EJEMPLO} />)
    const fila = screen.getByText('Claude Code').closest('tr')!
    // La insignia está en la celda de la herramienta (móvil) y en la columna Fuente (sm+).
    expect(within(fila).getAllByText('medido')).toHaveLength(2)
    expect(fila.querySelector('td:first-child [data-fuente-movil]')).toHaveTextContent('medido')
    expect(within(fila).getByText('Agente de código')).toBeInTheDocument()
    expect(within(screen.getByText('ChatGPT').closest('tr')!).getAllByText('declarado').length).toBeGreaterThan(0)
  })
})

describe('CuadranteConceptos', () => {
  it('ubica cada concepto en su cuadrante y marca los preguntados', () => {
    const { container } = render(<CuadranteConceptos datos={EJEMPLO} />)
    expect(container.querySelector('[data-cuadrante="ambos"] [data-concepto="rag"]')).not.toBeNull()
    const mcp = container.querySelector('[data-cuadrante="ninguno"] [data-concepto="mcp"]')!
    expect(mcp.getAttribute('data-preguntado')).toBe('true')
    expect(screen.getByRole('img', { name: 'resumen' })).toBeInTheDocument()
  })
})

describe('PerfilPrompts', () => {
  it('muestra las cuatro cifras', () => {
    render(<PerfilPrompts datos={EJEMPLO} />)
    for (const n of ['19', '120', '30%', '90%']) expect(screen.getByText(n)).toBeInTheDocument()
  })
})
