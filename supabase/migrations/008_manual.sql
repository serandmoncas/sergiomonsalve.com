-- Manual de Usuario: lectores invitados y comentarios.
-- RLS activado sin políticas: solo se accede con la service role.
CREATE TABLE manual_readers (
  email      TEXT PRIMARY KEY CHECK (email = lower(btrim(email))),
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  note       TEXT,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE manual_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_slug    TEXT NOT NULL,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  author_email TEXT NOT NULL,
  body         TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX manual_comments_note_slug_idx ON manual_comments(note_slug, created_at);
ALTER TABLE manual_readers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_comments ENABLE ROW LEVEL SECURITY;
