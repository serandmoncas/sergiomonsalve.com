import { describe, it, expect } from 'vitest'
import es from '@/messages/es.json'
import en from '@/messages/en.json'
import { WHATSAPP } from '../contact'

describe('WHATSAPP', () => {
  it('is the single public number for the whole site', () => {
    expect(WHATSAPP.number).toBe('573239105762')
    expect(WHATSAPP.display).toBe('+57 323 910 5762')
    expect(WHATSAPP.url).toBe('https://wa.me/573239105762')
  })

  it('is the number shown as the data controller contact in the privacy policy', () => {
    expect(es.privacy.sections[0].text).toContain('+57 323 910 5762')
    expect(en.privacy.sections[0].text).toContain('+57 323 910 5762')
  })
})
