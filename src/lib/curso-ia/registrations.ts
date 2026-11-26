import { createAdminClient } from '@/lib/supabase/server'
import { COHORTE } from './cohorte'

export type RegistrationStatus = 'confirmed' | 'waitlist'
export type Device = 'computer' | 'phone'
export type AiExperience = 'never' | 'sometimes' | 'often'

export type SeatInput = {
  email: string
  name: string
  whatsapp: string
  device: Device
  aiExperience: AiExperience
  goal: string
  project: string
  newsletter: boolean
  closed: boolean
}

export type SeatClaim = { status: RegistrationStatus; isNew: boolean; shouldEmail: boolean }

// La migración 009 se aplica a mano: si falta la tabla o la función, la API responde 503.
export class RegistrationsUnavailable extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RegistrationsUnavailable'
  }
}

const MISSING_CODES = new Set(['42P01', '42883', 'PGRST202', 'PGRST205'])

function toError(error: { code?: string; message?: string }): Error {
  const message = error.message ?? 'Supabase error'
  return error.code && MISSING_CODES.has(error.code) ? new RegistrationsUnavailable(message) : new Error(message)
}

// Asigna el cupo de forma atómica (ver claim_course_seat en 009_course_registrations.sql).
export async function claimCourseSeat(input: SeatInput): Promise<SeatClaim> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('claim_course_seat', {
    p_cohort: COHORTE.slug,
    p_email: input.email,
    p_name: input.name,
    p_whatsapp: input.whatsapp,
    p_device: input.device,
    p_ai_experience: input.aiExperience,
    p_goal: input.goal,
    p_project: input.project,
    p_newsletter: input.newsletter,
    p_capacity: COHORTE.capacity,
    p_closed: input.closed
  })
  if (error) throw toError(error)
  const row = (Array.isArray(data) ? data[0] : data) as
    | { status: RegistrationStatus; is_new: boolean; should_email: boolean }
    | null
    | undefined
  if (!row) throw new Error('claim_course_seat returned no row')
  return { status: row.status, isNew: row.is_new, shouldEmail: row.should_email }
}

export async function markEmailSent(email: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('course_registrations')
    .update({ last_email_sent_at: new Date().toISOString() })
    .eq('cohort', COHORTE.slug)
    .eq('email', email)
  if (error) throw toError(error)
}

// null si la tabla no existe o Supabase falla: la página se muestra sin contador.
export async function countConfirmed(): Promise<number | null> {
  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from('course_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('cohort', COHORTE.slug)
      .eq('status', 'confirmed')
    if (error || typeof count !== 'number') return null
    return count
  } catch {
    return null
  }
}

export async function confirmFromWaitlist(email: string): Promise<{ name: string } | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('course_registrations')
    .update({ status: 'confirmed' })
    .eq('cohort', COHORTE.slug)
    .eq('email', email)
    .eq('status', 'waitlist')
    .select('name')
    .maybeSingle()
  if (error) throw toError(error)
  return data ? { name: (data as { name: string }).name } : null
}
