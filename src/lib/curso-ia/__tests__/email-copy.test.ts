import { describe, it, expect } from 'vitest'
import { confirmedEmail, ownerNotice, waitlistEmail } from '../email-copy'
import type { RegistrationRequest } from '../schema'

const REG: RegistrationRequest = {
  name: 'Ana',
  email: 'ana@mail.com',
  whatsapp: '+573001112233',
  device: 'phone',
  aiExperience: 'sometimes',
  goal: 'Escribir mejor',
  project: 'Mi tienda',
  privacy: true,
  newsletter: false
}

describe('confirmedEmail', () => {
  const msg = confirmedEmail('Ana')

  it('greets the person and confirms the seat', () => {
    expect(msg.subject).toMatch(/cupo/i)
    expect(msg.text).toContain('Hola, Ana')
  })

  it('lists the four sessions with day names and the time', () => {
    for (const day of ['miércoles 9', 'jueves 10', 'lunes 14', 'martes 15']) expect(msg.text).toContain(day)
    expect(msg.text).toContain('7:00')
    expect(msg.text).toContain('8:30')
  })

  it('explains how to create the free account and where the call link comes from', () => {
    expect(msg.text).toContain('claude.ai')
    expect(msg.text).toMatch(/2 días antes/)
    expect(msg.text).toContain('wa.me/573239105762')
  })

  it('escapes the name in the HTML version', () => {
    expect(confirmedEmail('<b>x</b>').html).not.toContain('<b>x</b>')
  })
})

describe('waitlistEmail', () => {
  it('tells an on-time person they are on the waitlist', () => {
    expect(waitlistEmail('Ana', false).text).toMatch(/lista de espera/)
  })

  it('tells a late person the group already started', () => {
    expect(waitlistEmail('Ana', true).text).toContain('Te avisamos del próximo')
  })
})

describe('ownerNotice', () => {
  it('shows status and seats taken in the subject and the answers in the body', () => {
    const msg = ownerNotice(REG, 'confirmed', 7)
    expect(msg.subject).toContain('7/20')
    expect(msg.subject).toContain('Ana')
    expect(msg.text).toContain('+573001112233')
    expect(msg.text).toContain('Escribir mejor')
    expect(msg.text).toContain('Mi tienda')
  })

  it('works when the count is unknown', () => {
    expect(ownerNotice(REG, 'waitlist', null).subject).toContain('?/20')
  })
})
