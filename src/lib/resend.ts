import { Resend } from 'resend'
import type { ContactFormData } from './contact-schema'

const FROM = 'Sergio Monsalve <onboarding@resend.dev>'

export async function sendContactNotification(data: ContactFormData) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  await resend.emails.send({
    from: FROM,
    to: process.env.CONTACT_EMAIL!,
    subject: `Nuevo mensaje de ${data.name} (${data.projectType})`,
    text: [
      `De: ${data.name} <${data.email}>`,
      `Tipo: ${data.projectType}`,
      '',
      data.message
    ].join('\n')
  })
}

export type CommentNotificationData = {
  post_slug: string
  author_name: string
  author_email: string
  body: string
}

export async function sendCommentNotification(data: CommentNotificationData) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  await resend.emails.send({
    from: FROM,
    to: process.env.CONTACT_EMAIL!,
    subject: `Nuevo comentario en /blog/${data.post_slug}`,
    text: [
      `De: ${data.author_name} <${data.author_email}>`,
      `Post: /blog/${data.post_slug}`,
      '',
      data.body,
      '',
      '---',
      'Moderar: https://sergiomonsalve.com/es/admin/comments'
    ].join('\n')
  })
}
