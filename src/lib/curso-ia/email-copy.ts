import { COHORTE } from './cohorte'
import type { RegistrationStatus } from './registrations'
import type { RegistrationRequest } from './schema'

export type EmailMessage = { subject: string; text: string; html: string }

const SESSIONS = [
  'Clase 1 · miércoles 9 de diciembre: tu primera conversación útil y segura, y creas tu Palacio de Memoria (la biografía que le da contexto a la IA)',
  'Clase 2 · jueves 10 de diciembre: la IA con tus papeles, fotos y voz, y cómo no caer en estafas',
  'Clase 3 · lunes 14 de diciembre: tu asistente personal, que organiza tu día con lo que sabe de ti',
  'Clase 4 · martes 15 de diciembre: úsalo en tu día a día y mira hasta dónde llega esto'
]
const HOURS = 'Todas de 7:00 a 8:30 p. m. (hora de Colombia), por videollamada.'
const ACCOUNT_STEPS = [
  'Entra a https://claude.ai desde el computador.',
  'Crea tu cuenta gratuita con este mismo correo.',
  'Acepta las condiciones y abre un chat nuevo para comprobar que funciona.',
  'Escríbeme "listo" por WhatsApp. Si algo no te funciona, conéctate 15 minutos antes de la clase 1 y lo resolvemos juntos.'
]

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function greeting(name: string) {
  return name ? `Hola, ${name}:` : 'Hola:'
}

const SIGNATURE = 'Sergio Monsalve'

// Bloques: un string es un párrafo; un array es una lista.
function build(subject: string, blocks: (string | string[])[]): EmailMessage {
  const text = blocks
    .map(b => (Array.isArray(b) ? b.map((item, i) => `${i + 1}. ${item}`).join('\n') : b))
    .join('\n\n')
  const html = blocks
    .map(b =>
      Array.isArray(b)
        ? `<ol>${b.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`
        : `<p>${escapeHtml(b)}</p>`
    )
    .join('\n')
  return { subject, text, html }
}

export function confirmedEmail(name: string): EmailMessage {
  return build('Tienes cupo en el curso gratuito de IA', [
    greeting(name),
    'Tienes cupo en el curso gratuito de IA de diciembre. Estas son las 4 clases:',
    SESSIONS,
    HOURS,
    'El enlace de la videollamada te llega por WhatsApp y por correo 2 días antes de la primera clase.',
    'Antes de empezar, crea tu cuenta gratuita (toma 5 minutos):',
    ACCOUNT_STEPS,
    `Mi WhatsApp: ${COHORTE.whatsapp.display} · ${COHORTE.whatsapp.url}`,
    `Nos vemos el miércoles 9.\n${SIGNATURE}`
  ])
}

export function waitlistEmail(name: string, closed: boolean): EmailMessage {
  if (closed) {
    return build('El grupo de diciembre ya empezó', [
      greeting(name),
      'Gracias por inscribirte. Este grupo ya empezó, pero quedaste anotado. Te avisamos del próximo curso.',
      `Si tienes preguntas, escríbeme por WhatsApp: ${COHORTE.whatsapp.url}`,
      SIGNATURE
    ])
  }
  return build('Estás en la lista de espera del curso de IA', [
    greeting(name),
    `Los ${COHORTE.capacity} cupos del curso de diciembre ya se llenaron, pero quedaste en la lista de espera. Si se libera un cupo, te escribo en orden de llegada.`,
    `Si tienes preguntas, escríbeme por WhatsApp: ${COHORTE.whatsapp.url}`,
    SIGNATURE
  ])
}

const DEVICE: Record<RegistrationRequest['device'], string> = { computer: 'computador', phone: 'solo celular' }
const EXPERIENCE: Record<RegistrationRequest['aiExperience'], string> = {
  never: 'nunca',
  sometimes: 'alguna vez',
  often: 'la usa seguido'
}

export function ownerNotice(
  r: RegistrationRequest,
  status: RegistrationStatus,
  confirmedCount: number | null
): { subject: string; text: string } {
  const label = status === 'confirmed' ? 'Confirmada' : 'Lista de espera'
  return {
    subject: `Curso IA: ${label} — ${r.name} (${confirmedCount ?? '?'}/${COHORTE.capacity})`,
    text: [
      `${r.name} <${r.email}>`,
      `WhatsApp: ${r.whatsapp}`,
      `Se conecta desde: ${DEVICE[r.device]} · Ha usado IA: ${EXPERIENCE[r.aiExperience]}`,
      `Newsletter: ${r.newsletter ? 'sí' : 'no'}`,
      '',
      `¿Qué quiere hacer con la IA? ${r.goal}`,
      `Proyecto para la página: ${r.project || '—'}`
    ].join('\n')
  }
}
