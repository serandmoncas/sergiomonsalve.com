create table subscribers (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null unique,
  name               text,
  locale             text not null default 'es' check (locale in ('es', 'en')),
  source             text not null default 'mapa',
  newsletter         boolean not null default false,
  consented_at       timestamptz,
  status             text not null default 'active' check (status in ('active', 'unsubscribed')),
  unsubscribe_token  uuid not null unique default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  unsubscribed_at    timestamptz,
  last_plan_sent_at  timestamptz,
  constraint subscribers_email_lowercase check (email = lower(email))
);

alter table subscribers enable row level security;
-- Sin políticas públicas: solo el service role (rutas API y server actions) lee y escribe.

-- Reserva atómica del envío del plan: evita envíos duplicados por peticiones en paralelo
-- y errores por inserciones simultáneas del mismo correo. Devuelve una fila solo si se puede enviar.
create or replace function claim_plan_send(p_email text, p_name text, p_locale text)
returns table (unsubscribe_token uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into subscribers (email, name, locale, source)
  values (p_email, nullif(p_name, ''), p_locale, 'mapa')
  on conflict (email) do nothing;

  return query
  update subscribers s
     set last_plan_sent_at = now(),
         locale = p_locale,
         name = coalesce(nullif(p_name, ''), s.name)
   where s.email = p_email
     and (s.last_plan_sent_at is null or s.last_plan_sent_at < now() - interval '10 minutes')
  returning s.unsubscribe_token;
end;
$$;

revoke execute on function claim_plan_send(text, text, text) from public, anon, authenticated;
