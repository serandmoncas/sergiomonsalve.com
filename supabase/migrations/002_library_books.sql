CREATE TABLE library_books (
  asin        TEXT PRIMARY KEY,
  visible     BOOLEAN NOT NULL DEFAULT TRUE,
  status      TEXT    NOT NULL DEFAULT 'queued',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
