import { describe, it, expect } from 'vitest'
import { cleanCompany } from '../company'

describe('cleanCompany', () => {
  it('keeps a normal company name', () => {
    expect(cleanCompany('Somos Internet')).toBe('Somos Internet')
  })

  it('trims and collapses whitespace, including line breaks', () => {
    expect(cleanCompany('  Somos\n\tInternet  ')).toBe('Somos Internet')
  })

  it('returns null for missing, empty or non-string values', () => {
    expect(cleanCompany(undefined)).toBeNull()
    expect(cleanCompany('   ')).toBeNull()
    expect(cleanCompany(['Somos', 'Otra'])).toBeNull()
  })

  it('cuts names longer than 60 characters', () => {
    expect(cleanCompany('x'.repeat(80))).toHaveLength(60)
  })

  it('removes characters that are not part of a company name', () => {
    expect(cleanCompany('<script>Acme</script> S.A.S. & Cía')).toBe('scriptAcme/script S.A.S. & Cía')
  })
})
