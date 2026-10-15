import { z } from 'zod'

export const PROJECT_TYPES = ['freelance', 'fulltime', 'collaboration', 'training'] as const
export type ProjectType = (typeof PROJECT_TYPES)[number]

export function parseProjectType(value: unknown): ProjectType | undefined {
  return typeof value === 'string' && (PROJECT_TYPES as readonly string[]).includes(value)
    ? (value as ProjectType)
    : undefined
}

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  projectType: z.enum(PROJECT_TYPES),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

export type ContactFormData = z.infer<typeof contactSchema>
