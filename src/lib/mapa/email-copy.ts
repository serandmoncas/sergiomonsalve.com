export const planEmailCopy = {
  es: {
    subject: 'Tu plan MAPA de 30 días',
    greeting: (name: string) => (name ? `Hola, ${name}:` : 'Hola:'),
    intro: 'Aquí está el plan que armaste con la plantilla del Método MAPA. Guárdalo en tus notas y ponle fecha de inicio.',
    outro: 'Si quieres aplicar el método con tu equipo o en una cohorte en vivo, responde este correo o visita https://www.sergiomonsalve.com/es/formacion',
    signature: 'Sergio Monsalve',
    unsubscribe: 'No quiero recibir más correos'
  },
  en: {
    subject: 'Your 30-day MAPA plan',
    greeting: (name: string) => (name ? `Hi ${name},` : 'Hi,'),
    intro: 'Here is the plan you built with the MAPA Method template. Save it in your notes and give it a start date.',
    outro: 'If you want to apply the method with your team or in a live cohort, reply to this email or visit https://www.sergiomonsalve.com/en/formacion',
    signature: 'Sergio Monsalve',
    unsubscribe: 'Stop receiving emails'
  }
} as const
