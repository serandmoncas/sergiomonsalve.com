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
  constraint subscribers_email_lowercase check (email = lower(email))
);

alter table subscribers enable row level security;
-- Sin políticas públicas: solo el service role (rutas API y server actions) lee y escribe.
