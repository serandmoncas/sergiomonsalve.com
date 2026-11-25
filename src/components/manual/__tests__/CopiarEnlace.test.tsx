import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }))

import { CopiarEnlace } from '../CopiarEnlace'

describe('CopiarEnlace', () => {
  it('copia la URL sin parámetros de seguimiento', () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    window.history.pushState({}, '', '/es/manual-de-usuario/n/x?r=ruta&utm_source=a&fbclid=b')
    render(<CopiarEnlace />)
    fireEvent.click(screen.getByRole('button'))
    const url = new URL(writeText.mock.calls[0][0])
    expect(url.searchParams.get('r')).toBe('ruta')
    expect(url.searchParams.has('utm_source')).toBe(false)
    expect(url.searchParams.has('fbclid')).toBe(false)
  })
})
