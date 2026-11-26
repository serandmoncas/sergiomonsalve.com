import { describe, it, expect } from 'vitest'
import es from '@/messages/es.json'
import { confirmedEmail } from '../email-copy'

const c = es.cursoIa

describe('programa del curso: hilo del asistente personal', () => {
  it('promete un asistente personal que te conoce, no una página web', () => {
    expect(c.lede).toMatch(/asistente personal/)
    expect(c.lede).not.toMatch(/página/)
  })

  it('la clase 1 crea el Palacio de Memoria', () => {
    expect(c.program.sessions.s1.title).toContain('Palacio de Memoria')
  })

  it('la clase 3 convierte el Palacio en tu asistente personal', () => {
    expect(c.program.sessions.s3.title).toMatch(/asistente personal/i)
  })

  it('el correo de confirmación lista el programa nuevo', () => {
    const { text } = confirmedEmail('Ana')
    expect(text).toContain('Palacio de Memoria')
    expect(text).toMatch(/asistente personal/)
    expect(text).not.toMatch(/página web/)
  })
})
