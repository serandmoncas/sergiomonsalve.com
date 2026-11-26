import { describe, it, expect } from 'vitest'
import { LINK_MESSAGE } from '@/lib/mapa/schema'
import { normalizeWhatsapp, registrationSchema } from '../schema'

const VALID = {
  name: 'Ana Pérez',
  email: 'ana@mail.com',
  whatsapp: '300 111 2233',
  device: 'computer',
  aiExperience: 'never',
  goal: 'Escribir mensajes difíciles',
  project: 'Mi tienda de arepas',
  privacy: true,
  newsletter: false
}

describe('normalizeWhatsapp', () => {
  it.each(['323 910 5762', '3239105762', '+57 323-910-5762', '(+57) 323 910 5762'])(
    'normalizes Colombian number %s to E.164',
    raw => {
      expect(normalizeWhatsapp(raw)).toBe('+573239105762')
    }
  )

  it('keeps foreign numbers with a country code', () => {
    expect(normalizeWhatsapp('+1 415 555 0100')).toBe('+14155550100')
  })

  it.each(['12345', '', 'hola', '+12', '1234567890'])('rejects %s', raw => {
    expect(normalizeWhatsapp(raw)).toBeNull()
  })
})

describe('registrationSchema', () => {
  it('accepts a valid registration and normalizes email and WhatsApp', () => {
    const r = registrationSchema.parse({ ...VALID, email: ' Ana@Mail.com ' })
    expect(r.email).toBe('ana@mail.com')
    expect(r.whatsapp).toBe('+573001112233')
    expect(r.name).toBe('Ana Pérez')
  })

  it('requires the privacy consent', () => {
    expect(registrationSchema.safeParse({ ...VALID, privacy: false }).success).toBe(false)
  })

  it('rejects an invalid WhatsApp with a specific message', () => {
    const r = registrationSchema.safeParse({ ...VALID, whatsapp: '12345' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].path).toEqual(['whatsapp'])
    expect(r.error?.issues[0].message).toBe('invalid_whatsapp')
  })

  it('blocks links in free text', () => {
    const r = registrationSchema.safeParse({ ...VALID, goal: 'mira https://x.co' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe(LINK_MESSAGE)
  })

  it('limits goal to 500 characters', () => {
    expect(registrationSchema.safeParse({ ...VALID, goal: 'a'.repeat(501) }).success).toBe(false)
  })

  it('requires a non-empty goal and name', () => {
    expect(registrationSchema.safeParse({ ...VALID, goal: '   ' }).success).toBe(false)
    expect(registrationSchema.safeParse({ ...VALID, name: '' }).success).toBe(false)
  })

  it('defaults a missing project to an empty string', () => {
    const { project: _omit, ...rest } = VALID
    expect(registrationSchema.parse(rest).project).toBe('')
  })

  it('only accepts the known device and experience options', () => {
    expect(registrationSchema.safeParse({ ...VALID, device: 'tablet' }).success).toBe(false)
    expect(registrationSchema.safeParse({ ...VALID, aiExperience: 'expert' }).success).toBe(false)
  })
})
