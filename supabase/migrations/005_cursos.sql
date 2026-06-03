CREATE TABLE courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT NOT NULL,
  thumbnail_url  TEXT,
  is_published   BOOLEAN NOT NULL DEFAULT FALSE,
  is_free        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE modules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  "order"      INT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE lessons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id         UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  "order"           INT NOT NULL,
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  youtube_video_id  TEXT,
  duration_minutes  INT,
  content_mdx       TEXT,
  template_ref      VARCHAR(255)
);

CREATE TABLE enrollments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at  TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

CREATE TABLE lesson_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

-- RLS
ALTER TABLE courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons        ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- courses: lectura pública de cursos publicados
CREATE POLICY "courses_public_read" ON courses
  FOR SELECT USING (is_published = true);

-- modules: lectura pública de módulos publicados de cursos publicados
CREATE POLICY "modules_public_read" ON modules
  FOR SELECT USING (
    is_published = true AND
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.is_published = true)
  );

-- lessons: lectura pública de lecciones publicadas (sin content_mdx — se sirve por API)
CREATE POLICY "lessons_public_read" ON lessons
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
        AND modules.is_published = true
        AND courses.is_published = true
    )
  );

-- enrollments: estudiante ve y crea los suyos
CREATE POLICY "enrollments_student_read" ON enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "enrollments_student_insert" ON enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- lesson_progress: estudiante ve y modifica los suyos
CREATE POLICY "progress_student_read" ON lesson_progress
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "progress_student_upsert" ON lesson_progress
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "progress_student_update" ON lesson_progress
  FOR UPDATE USING (student_id = auth.uid());
