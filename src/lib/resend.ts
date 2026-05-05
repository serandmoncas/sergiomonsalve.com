import { Resend } from 'resend'
import type { ContactFormData } from './contact-schema'

export async function sendContactNotification(data: ContactFormData) {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  await resend.emails.send({
    from: 'sergiomonsalve.com <noreply@sergiomonsalve.com>',
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
