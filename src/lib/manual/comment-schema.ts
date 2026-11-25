import { z } from 'zod'

// Slug de nota: nombre de archivo en minúsculas, sin ".md".
export const noteSlugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,120}$/)

export const manualCommentSchema = z.object({
  note_slug: noteSlugSchema,
  body: z.string().trim().min(1).max(4000)
})

export type ManualCommentInput = z.infer<typeof manualCommentSchema>
