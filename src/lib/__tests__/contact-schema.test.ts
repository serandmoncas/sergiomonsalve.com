import { describe, it, expect } from 'vitest'
import { contactSchema, PROJECT_TYPES, parseProjectType } from '../contact-schema'

describe('contactSchema', () => {
  const valid = {
    name: 'Ana García',
    email: 'ana@example.com',
    projectType: 'freelance' as const,
    message: 'Hola, me gustaría trabajar contigo.'
  }

  it('accepts a valid submission', () => {
    const result = contactSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = contactSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error!.issues[0].path).toContain('name')
  })

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error!.issues[0].path).toContain('email')
  })

  it('rejects unknown projectType', () => {
    const result = contactSchema.safeParse({ ...valid, projectType: 'consulting' })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error!.issues[0].path).toContain('projectType')
  })

  it('rejects message shorter than 10 characters', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'Hi' })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error!.issues[0].path).toContain('message')
  })

  it('accepts all four project types', () => {
    for (const type of PROJECT_TYPES) {
      const result = contactSchema.safeParse({ ...valid, projectType: type })
      expect(result.success).toBe(true)
    }
  })

  it('parseProjectType returns a valid type or undefined', () => {
    expect(parseProjectType('training')).toBe('training')
    expect(parseProjectType('hacker')).toBeUndefined()
    expect(parseProjectType(undefined)).toBeUndefined()
    expect(parseProjectType(['training'])).toBeUndefined()
  })
})
