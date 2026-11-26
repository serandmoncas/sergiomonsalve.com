-- Inscripciones a cursos en vivo (primera cohorte: curso gratuito de IA de diciembre 2026).
-- Se aplica a mano en Supabase → SQL editor, igual que la 008.

create table course_registrations (
  id                     uuid primary key default gen_random_uuid(),
  cohort                 text not null,
  name                   text not null,
  email                  text not null,
  whatsapp               text not null,
  device                 text not null check (device in ('computer', 'phone')),
  ai_experience          text not null check (ai_experience in ('never', 'sometimes', 'often')),
  goal                   text not null,
  project                text not null default '',
  status                 text not null check (status in ('confirmed', 'waitlist', 'cancelled')),
  privacy_consented_at   timestamptz not null,
  newsletter             boolean not null default false,
  created_at             timestamptz not null default now(),
  last_email_attempt_at  timestamptz,
  last_email_sent_at     timestamptz,
  constraint course_registrations_email_lowercase check (email = lower(email)),
  constraint course_registrations_cohort_email unique (cohort, email)
);

create index idx_course_registrations_cohort_status on course_registrations (cohort, status);

alter table course_registrations enable row level security;
-- Sin políticas públicas: solo el service role (rutas API y scripts) lee y escribe.

-- Asigna el cupo de forma atómica. El bloqueo por cohorte serializa las inscripciones
-- simultáneas, así que nunca quedan más de p_capacity confirmadas.
-- Correo existente: no cambia el estado; should_email solo si pasaron 10 minutos desde el último intento.
create or replace function claim_course_seat(
  p_cohort text, p_email text, p_name text, p_whatsapp text, p_device text,
  p_ai_experience text, p_goal text, p_project text, p_newsletter boolean,
  p_capacity int, p_closed boolean
)
returns table (status text, is_new boolean, should_email boolean)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_status text;
  v_attempt timestamptz;
  v_confirmed int;
begin
  perform pg_advisory_xact_lock(hashtext('course_registrations:' || p_cohort));

  select r.status, r.last_email_attempt_at into v_status, v_attempt
    from course_registrations r
   where r.cohort = p_cohort and r.email = p_email;

  if found then
    if v_attempt is null or v_attempt < now() - interval '10 minutes' then
      update course_registrations r set last_email_attempt_at = now()
       where r.cohort = p_cohort and r.email = p_email;
      return query select v_status, false, true;
    else
      return query select v_status, false, false;
    end if;
    return;
  end if;

  select count(*) into v_confirmed
    from course_registrations r
   where r.cohort = p_cohort and r.status = 'confirmed';

  v_status := case when p_closed or v_confirmed >= p_capacity then 'waitlist' else 'confirmed' end;

  insert into course_registrations (
    cohort, name, email, whatsapp, device, ai_experience, goal, project,
    status, privacy_consented_at, newsletter, last_email_attempt_at
  ) values (
    p_cohort, p_name, p_email, p_whatsapp, p_device, p_ai_experience, p_goal, coalesce(p_project, ''),
    v_status, now(), p_newsletter, now()
  );

  return query select v_status, true, true;
end;
$$;

revoke execute on function claim_course_seat(text, text, text, text, text, text, text, text, boolean, int, boolean)
  from public, anon, authenticated;

-- Consultas útiles (copiar en el SQL editor):
--
-- Confirmados, para mandar el enlace de la videollamada:
--   select name, email, whatsapp, device, ai_experience, goal, project
--     from course_registrations
--    where cohort = 'ia-diciembre-2026' and status = 'confirmed'
--    order by created_at;
--
-- Lista de espera, en orden de llegada:
--   select name, email, whatsapp, created_at from course_registrations
--    where cohort = 'ia-diciembre-2026' and status = 'waitlist' order by created_at;
--
-- Correos que no salieron:
--   select name, email, whatsapp, status from course_registrations
--    where cohort = 'ia-diciembre-2026' and last_email_sent_at is null;
--
-- Prueba manual del cupo (con capacidad 1, la segunda llamada debe devolver 'waitlist'):
--   begin;
--   select * from claim_course_seat('prueba', 'a@x.co', 'A', '+570000000000', 'computer', 'never', 'x', '', false, 1, false);
--   select * from claim_course_seat('prueba', 'b@x.co', 'B', '+570000000001', 'computer', 'never', 'x', '', false, 1, false);
--   rollback;
