import { describe, it, expect } from 'vitest'
import sitemap from '../sitemap'

describe('sitemap', () => {
  it('no lista el manual de usuario', () => {
    expect(sitemap().some(e => e.url.includes('manual-de-usuario'))).toBe(false)
  })
})
