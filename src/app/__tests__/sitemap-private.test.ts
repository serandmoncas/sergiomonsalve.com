import { describe, it, expect } from 'vitest'
import sitemap from '../sitemap'

describe('sitemap', () => {
  it('does not list the private proposal page', () => {
    expect(sitemap().some(entry => entry.url.includes('/propuesta'))).toBe(false)
  })
})
