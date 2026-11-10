import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import IlustracionAve from '../IlustracionAve'
import { especie } from '@/lib/aves/__tests__/especie-de-prueba'
import type { Ilustracion } from '@/lib/aves/tipos'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))

const ilustracion = (variante: Ilustracion['variante']): Ilustracion => ({
  variante, estado: 'aprobada', archivo: `azulejo-comun--${variante}`, referencias: [], nota: '', actualizado: '2026-10-30',
})

describe('IlustracionAve', () => {
  it('sin ilustraciones aprobadas muestra la silueta', () => {
    render(<IlustracionAve especie={especie('azulejo-comun', {})} tamano={512} />)
    expect(screen.getByText('ilustracionEnCamino')).toBeInTheDocument()
  })

  it('con una aprobada muestra su WebP del tamaño pedido', () => {
    render(<IlustracionAve especie={especie('azulejo-comun', { ilustraciones: [ilustracion('macho')] })} tamano={512} />)
    expect(screen.getByRole('img').getAttribute('src')).toContain('--macho-512.webp')
  })

  it('si la variante pedida no está aprobada muestra la silueta', () => {
    render(<IlustracionAve especie={especie('azulejo-comun', { ilustraciones: [ilustracion('macho')] })} tamano={512} variante="hembra" />)
    expect(screen.getByText('ilustracionEnCamino')).toBeInTheDocument()
  })
})
