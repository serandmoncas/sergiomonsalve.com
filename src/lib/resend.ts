import { Resend } from 'resend'
import type { ContactFormData } from './contact-schema'
import { planEmailCopy } from './mapa/email-copy'

const FROM = 'Sergio Monsalve <noreply@sergiomonsalve.com>'

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

export type PlanEmailData = {
  to: string
  name: string
  locale: 'es' | 'en'
  plan: string
  unsubscribeUrl: string
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function sendPlanEmail(d: PlanEmailData) {
  const c = planEmailCopy[d.locale]
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const { error } = await resend.emails.send({
    from: FROM,
    to: d.to,
    replyTo: process.env.CONTACT_EMAIL,
    subject: c.subject,
    text: [c.greeting(d.name), '', c.intro, '', d.plan, '', c.outro, '', c.signature, '', `${c.unsubscribe}: ${d.unsubscribeUrl}`].join('\n'),
    html: [
      `<p>${escapeHtml(c.greeting(d.name))}</p>`,
      `<p>${escapeHtml(c.intro)}</p>`,
      `<pre style="font-family:Menlo,Consolas,monospace;font-size:13px;line-height:1.6;background:#f4f1ea;padding:16px;border-radius:4px;white-space:pre-wrap">${escapeHtml(d.plan)}</pre>`,
      `<p>${escapeHtml(c.outro)}</p>`,
      `<p>${escapeHtml(c.signature)}</p>`,
      `<p style="font-size:12px;color:#777"><a href="${escapeHtml(d.unsubscribeUrl)}">${escapeHtml(c.unsubscribe)}</a></p>`
    ].join('\n'),
    headers: { 'List-Unsubscribe': `<${d.unsubscribeUrl}>` }
  })
  if (error) throw new Error(error.message)
}

export async function subscribeNewsletterContact(email: string, name: string) {
  const segmentId = process.env.RESEND_SEGMENT_ID
  if (!segmentId) return
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const created = await resend.contacts.create({
    email,
    firstName: name || undefined,
    unsubscribed: false,
    segments: [{ id: segmentId }]
  })
  if (!created.error) return
  const updated = await resend.contacts.update({ email, unsubscribed: false })
  if (updated.error) throw new Error(updated.error.message)
  const added = await resend.contacts.segments.add({ email, segmentId })
  if (added.error) throw new Error(added.error.message)
}

export async function unsubscribeNewsletterContact(email: string) {
  if (!process.env.RESEND_SEGMENT_ID) return
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const { error } = await resend.contacts.update({ email, unsubscribed: true })
  if (error) throw new Error(error.message)
}
