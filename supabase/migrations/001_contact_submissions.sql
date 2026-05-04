create table contact_submissions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  project_type text not null check (project_type in ('freelance', 'fulltime', 'collaboration')),
  message      text not null,
  created_at   timestamptz not null default now(),
  read         boolean not null default false
);

alter table contact_submissions enable row level security;
-- No public policies: only service role key (used in /api/contact) can insert/read
