import { z } from 'zod'

// Bloquea enlaces para que el endpoint no sirva para enviar spam o phishing desde nuestro dominio.
// Esquemas (https://, ftp://), www., cualquier dominio seguido de una ruta (evil.shop/login) y dominios
// sueltos con TLD de uso común en spam. Deja pasar nombres técnicos como ASP.NET, Node.js o Socket.io.
export const LINK_MESSAGE = 'Links are not allowed'
const LINK =
  /(:\/\/|https?:|www\.|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\/|\b[a-z0-9-]+\.(?:com|org|co|es|mx|cl|ly|xyz|ru|info|biz|shop|site|top|link|click)\b)/i

const text = (max: number) =>
  z.string().max(max).refine(value => !LINK.test(value), { message: LINK_MESSAGE })

export const HOURS_OPTIONS = ['2', '3', '5', '8', '10'] as const

export const mapaDataSchema = z.object({
  skill: text(200),
  outcome: text(200),
  why: text(200),
  hours: z.enum(HOURS_OPTIONS),
  project: text(400),
  firstStep: text(200),
  weak: text(200),
  drill: text(200),
  recall: text(600),
  feedback: text(200),
  reviewDay: text(20),
  pieces: z.array(z.object({ text: text(100), key: z.boolean() })).max(15)
})

export const planRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: text(80).transform(value => value.trim()).optional().default(''),
  locale: z.enum(['es', 'en']),
  newsletter: z.boolean(),
  data: mapaDataSchema
})

export type PlanRequest = z.infer<typeof planRequestSchema>

export function isHoneypotFilled(body: unknown): boolean {
  if (!body || typeof body !== 'object' || !('website' in body)) return false
  const value = (body as { website: unknown }).website
  return typeof value === 'string' && value.trim() !== ''
}
