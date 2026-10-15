import { z } from 'zod'

export const planRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().max(80).optional().default(''),
  locale: z.enum(['es', 'en']),
  plan: z.string().min(1).max(6000),
  newsletter: z.boolean()
})

export type PlanRequest = z.infer<typeof planRequestSchema>

export function isHoneypotFilled(body: unknown): boolean {
  if (!body || typeof body !== 'object' || !('website' in body)) return false
  const value = (body as { website: unknown }).website
  return typeof value === 'string' && value.trim() !== ''
}
