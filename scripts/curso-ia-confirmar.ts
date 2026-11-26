// Pasa a alguien de la lista de espera a confirmado y le envía el correo "Tienes cupo".
// Uso: npm run curso-ia:confirmar -- correo@ejemplo.com [--force]
// No pasa de 20 confirmados: marca antes como 'cancelled' a quien se retiró, o usa --force.
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envVars = Object.fromEntries(
  readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
Object.assign(process.env, envVars)

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const email = (args.find(a => a !== '--force') ?? '').trim().toLowerCase()
  if (!email.includes('@')) {
    console.error('Uso: npm run curso-ia:confirmar -- correo@ejemplo.com')
    process.exit(1)
  }
  const { promoteFromWaitlist, markEmailSent, RegistrationsUnavailable } = await import('../src/lib/curso-ia/registrations')
  const { confirmedEmail } = await import('../src/lib/curso-ia/email-copy')
  const { sendCourseEmail } = await import('../src/lib/resend')

  let result: Awaited<ReturnType<typeof promoteFromWaitlist>>
  try {
    result = await promoteFromWaitlist(email, { force })
  } catch (error) {
    if (error instanceof RegistrationsUnavailable) {
      console.error('La tabla course_registrations no existe: aplica supabase/migrations/009_course_registrations.sql.')
    } else {
      console.error('Error de Supabase:', error)
    }
    process.exit(1)
  }
  if (!result.ok) {
    if (result.reason === 'full') {
      console.error(`Ya hay ${result.confirmed} confirmados. Marca como 'cancelled' a quien se retiró, o usa --force.`)
    } else if (result.reason === 'unknown_count') {
      console.error('No se pudo leer cuántos confirmados hay. Revisa la tabla, o usa --force.')
    } else {
      console.error(`${email} no estaba en la lista de espera (o no existe en la cohorte).`)
    }
    process.exit(1)
  }
  const row = { name: result.name }
  console.log(`Confirmado: ${row.name} <${email}>`)
  try {
    await sendCourseEmail(email, confirmedEmail(row.name))
    await markEmailSent(email)
    console.log('Correo "Tienes cupo" enviado.')
  } catch (error) {
    console.error('Quedó confirmado, pero el correo falló. Escríbele por WhatsApp.', error)
    process.exit(1)
  }
}

main()
