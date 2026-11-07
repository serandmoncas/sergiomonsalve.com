import { describe, it, expect } from 'vitest'
import sitemap from '../sitemap'
import { getEspecies } from '@/lib/aves/catalogo'

describe('sitemap de la guía de aves', () => {
  const urls = sitemap().map(e => e.url)

  it('incluye la guía en los dos idiomas', () => {
    expect(urls).toContain('https://sergiomonsalve.com/es/aves')
    expect(urls).toContain('https://sergiomonsalve.com/en/aves')
  })

  it('incluye la ficha de cada especie', () => {
    const primera = getEspecies()[0]
    expect(urls).toContain(`https://sergiomonsalve.com/es/aves/${primera.slug}`)
    expect(urls.filter(u => u.includes('/aves/'))).toHaveLength(getEspecies().length * 2)
  })
})
