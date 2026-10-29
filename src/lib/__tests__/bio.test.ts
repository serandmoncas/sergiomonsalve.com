import { describe, it, expect } from 'vitest'
import { getBio } from '../bio'

describe('getBio', () => {
  it.each(['es', 'en'])('loads the %s biography with title and description', locale => {
    const bio = getBio(locale)
    expect(bio).not.toBeNull()
    expect(bio!.title).toBeTruthy()
    expect(bio!.description).toBeTruthy()
    expect(bio!.content).toContain('##')
  })

  it('returns null for an unknown locale', () => {
    expect(getBio('fr')).toBeNull()
  })

  it('links internal pages with the same locale', () => {
    for (const locale of ['es', 'en']) {
      const other = locale === 'es' ? 'en' : 'es'
      expect(getBio(locale)!.content).not.toContain(`](/${other}/`)
    }
  })
})
