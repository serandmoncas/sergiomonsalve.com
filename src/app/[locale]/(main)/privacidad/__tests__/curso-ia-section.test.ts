import { describe, it, expect } from 'vitest'
import es from '@/messages/es.json'
import en from '@/messages/en.json'

const find = (sections: { title: string; text: string }[], re: RegExp) => sections.find(s => re.test(s.title))

describe('privacy policy: live course registrations', () => {
  it('explains in Spanish what is kept, why, for how long and how to delete it', () => {
    const s = find(es.privacy.sections, /inscripción a cursos en vivo/i)
    expect(s).toBeDefined()
    expect(s!.text).toContain('WhatsApp')
    expect(s!.text).toContain('12 meses')
    expect(s!.text).toMatch(/borr|supresi/i)
  })

  it('has the English equivalent', () => {
    const s = find(en.privacy.sections, /live course/i)
    expect(s).toBeDefined()
    expect(s!.text).toContain('12 months')
  })
})
