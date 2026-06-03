import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressBar from '../ProgressBar'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === 'progreso') return `${values?.completed} de ${values?.total} lecciones completadas`
    return key
  }
}))

describe('ProgressBar', () => {
  it('shows completed and total count', () => {
    render(<ProgressBar completed={3} total={10} />)
    expect(screen.getByText('3 de 10 lecciones completadas')).toBeDefined()
  })

  it('renders progress bar at correct width', () => {
    const { container } = render(<ProgressBar completed={5} total={10} />)
    const bar = container.querySelector('[style]')
    expect(bar?.getAttribute('style')).toContain('50%')
  })

  it('handles 0 total without divide-by-zero', () => {
    render(<ProgressBar completed={0} total={0} />)
    expect(screen.getByText('0 de 0 lecciones completadas')).toBeDefined()
  })
})
