import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CuposBadge from '../CuposBadge'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key
}))

describe('CuposBadge', () => {
  it('shows the seats left out of the capacity', () => {
    render(<CuposBadge confirmed={7} capacity={20} closed={false} />)
    expect(screen.getByText('cuposLeft:{"left":13,"capacity":20}')).toBeInTheDocument()
  })

  it('says the seats are full at capacity', () => {
    render(<CuposBadge confirmed={20} capacity={20} closed={false} />)
    expect(screen.getByText('cuposFull')).toBeInTheDocument()
  })

  it('says registrations are closed after the start', () => {
    render(<CuposBadge confirmed={5} capacity={20} closed />)
    expect(screen.getByText('cuposClosed')).toBeInTheDocument()
  })

  it('renders nothing when the count is unknown', () => {
    const { container } = render(<CuposBadge confirmed={null} capacity={20} closed={false} />)
    expect(container).toBeEmptyDOMElement()
  })
})
