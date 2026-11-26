import { z } from 'zod'
import { LINK, LINK_MESSAGE } from '@/lib/mapa/schema'

// Normaliza a E.164. Sin indicativo, solo acepta celulares de Colombia (10 dígitos que empiezan por 3).
export function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (raw.includes('+')) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null
  if (digits.length === 10 && digits.startsWith('3')) return `+57${digits}`
  if (digits.length === 12 && digits.startsWith('573')) return `+${digits}`
  return null
}

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(value => !LINK.test(value), { message: LINK_MESSAGE })

export const registrationSchema = z.object({
  name: text(80).pipe(z.string().min(1)),
  email: z.string().trim().toLowerCase().email().max(254),
  whatsapp: z
    .string()
    .max(30)
    .transform((value, ctx) => {
      const normalized = normalizeWhatsapp(value)
      if (!normalized) {
        ctx.addIssue({ code: 'custom', message: 'invalid_whatsapp' })
        return z.NEVER
      }
      return normalized
    }),
  device: z.enum(['computer', 'phone']),
  aiExperience: z.enum(['never', 'sometimes', 'often']),
  goal: text(500).pipe(z.string().min(1)),
  project: text(300).optional().default(''),
  privacy: z.literal(true),
  newsletter: z.boolean().optional().default(false)
})

export type RegistrationRequest = z.infer<typeof registrationSchema>
