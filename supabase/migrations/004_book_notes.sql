CREATE TABLE book_notes (
  book_id     TEXT PRIMARY KEY,
  rating      INT CHECK (rating >= 1 AND rating <= 5),
  highlights  TEXT[] NOT NULL DEFAULT '{}',
  review_md   TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
