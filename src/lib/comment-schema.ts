import { z } from 'zod'

export const commentSchema = z.object({
  post_slug: z.string().min(1),
  author_name: z.string().min(1).max(100),
  author_email: z.string().email(),
  body: z.string().min(2).max(2000),
  website: z.string().max(0, 'Bot detected') // honeypot — must be empty
})

export type CommentInput = z.infer<typeof commentSchema>
