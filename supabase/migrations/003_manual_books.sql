CREATE TABLE manual_books (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  authors        TEXT[] NOT NULL DEFAULT '{}',
  cover_url      TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  source_type    TEXT NOT NULL DEFAULT 'physical',
  isbn           TEXT,
  published_year INT,
  visible        BOOLEAN NOT NULL DEFAULT TRUE,
  status         TEXT NOT NULL DEFAULT 'queued',
  added_at       TIMESTAMPTZ DEFAULT NOW()
);
