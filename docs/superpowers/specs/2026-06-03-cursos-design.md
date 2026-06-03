# Sección /cursos — Design Spec

**Fecha:** 2026-06-03  
**Estado:** Aprobado  
**Repo de referencia:** serandmoncas/songosorhongo.com  

---

## Contexto

Agregar una plataforma de cursos a sergiomonsalve.com. El primer curso es "Personal Page Recipe" (gratis, auto-enrollment). El contenido de lecciones es MDX con video YouTube opcional. Los estudiantes pueden marcar lecciones como completadas.

---

## Decisiones arquitectónicas

| Decisión | Elección | Razón |
|----------|----------|-------|
| Backend | Next.js API routes + Supabase | Stack existente, sin nueva infraestructura |
| i18n | Dentro de `[locale]` → `/es/cursos` | Coherente con todo el sitio |
| Auth estudiantes | Supabase email + contraseña | Conveniente para acceso frecuente, reutiliza cliente existente |
| Contenido MDX | Columna `lessons.content_mdx` en DB | Simplifica el enrollment gate a una query |

---

## Base de datos

Migración: `supabase/migrations/005_cursos.sql`

### Tablas

```sql
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
```

### RLS

- `courses`, `modules`, `lessons`: lectura pública donde `is_published = true`. `content_mdx` **no** se expone directamente — solo vía API route con enrollment check.
- `enrollments`: estudiante puede SELECT/INSERT donde `student_id = auth.uid()`.
- `lesson_progress`: estudiante puede SELECT/INSERT/UPDATE donde `student_id = auth.uid()`.
- Operaciones de admin usan `createAdminClient()` (service role, bypassa RLS).

### Diferenciación admin vs estudiante

- Admin: tiene record en `profiles` con `role = 'admin'`.
- Estudiante: usuario normal de `auth.users`, sin record en `profiles`.

---

## Auth de estudiantes

- **Registro:** `supabase.auth.signUp({ email, password, options: { data: { name } } })`
- **Login:** `supabase.auth.signInWithPassword({ email, password })`
- **Logout:** `supabase.auth.signOut()`
- Sesión en cookies (igual que admin). Usa `src/lib/supabase/client.ts` existente.
- No se usan localStorage ni JWT propios.

---

## Middleware (`src/proxy.ts`)

Se agregan rutas protegidas para estudiantes al auth guard existente:

```
/[locale]/cursos/mi-acceso        → requiere sesión Supabase
/[locale]/cursos/[slug]/aprender  → requiere sesión Supabase
```

Sin sesión → redirect a `/[locale]/cursos/login`.

La verificación de enrollment en `/aprender` ocurre en el componente (client-side), no en el middleware, para mantener el middleware liviano.

---

## Rutas frontend

Todas bajo `src/app/[locale]/cursos/`:

| Ruta | Tipo | Acceso |
|------|------|--------|
| `/cursos` | Server component | Público |
| `/cursos/registro` | Client component | Público |
| `/cursos/login` | Client component | Público |
| `/cursos/mi-acceso` | Server component | Auth requerida |
| `/cursos/[slug]` | Server component | Público |
| `/cursos/[slug]/aprender` | Client component | Auth + enrollment |

---

## API routes

Todas bajo `src/app/api/cursos/`:

### `POST /api/cursos/[slug]/enrollar`

- Auth requerida.
- Si `course.is_free`: inserta enrollment con `status='approved'`, `approved_at=now()`, `expires_at=null`.
- Si no es free: `status='pending'`.
- Idempotente: si ya existe enrollment activo, devuelve el existente sin crear duplicado.

### `GET /api/cursos/[slug]/progreso`

- Auth requerida.
- Devuelve array de `lesson_id` completadas por el estudiante en ese curso.

### `POST /api/cursos/[slug]/lecciones/[id]/completar`

- Auth + enrollment activo requeridos.
- Upsert en `lesson_progress`: `completed=true`, `completed_at=now()`.

### `GET /api/cursos/[slug]/lecciones/[id]/contenido`

- Auth + enrollment activo requeridos.
- Devuelve `{ content_mdx, youtube_video_id, template_ref }`.
- Único punto de acceso a `content_mdx`.

**Enrollment activo:** `status = 'approved'` AND (`expires_at IS NULL` OR `expires_at > now()`).

### Helper compartido

`src/lib/cursos/enrollment.ts`:
- `checkActiveEnrollment(supabase, studentId, courseSlug): Promise<boolean>`
- `getOrCreateEnrollment(supabase, studentId, courseId): Promise<Enrollment>`

---

## Tipos TypeScript

`src/lib/cursos/types.ts` (basado en `cursos-types.ts` de songosorhongo.com + extensiones):

```typescript
interface CourseListItem {
  id: string; title: string; slug: string; description: string;
  thumbnail_url: string | null; module_count: number; lesson_count: number; is_free: boolean;
}

interface LessonPublic {
  id: string; title: string; description: string | null;
  duration_minutes: number | null; order: number;
  template_ref: string | null;  // nuevo
}

interface ModulePublic {
  id: string; title: string; description: string | null; order: number;
  lessons: LessonPublic[];
}

interface CourseDetail extends CourseListItem {
  modules: ModulePublic[];
}

interface Enrollment {
  id: string; course_id: string; course_slug: string; status: 'pending' | 'approved' | 'rejected';
  requested_at: string; approved_at: string | null; expires_at: string | null; is_active: boolean;
}

interface LessonProgress {          // nuevo
  lesson_id: string; completed: boolean; completed_at: string | null;
}

interface LessonContent {           // nuevo
  content_mdx: string | null; youtube_video_id: string | null; template_ref: string | null;
}
```

---

## Componentes

Todos en `src/components/cursos/`:

| Componente | Descripción |
|------------|-------------|
| `CourseCard.tsx` | Tarjeta en el listado: thumbnail, título, descripción, conteo módulos/lecciones, badge "Gratis" |
| `EnrollmentCTA.tsx` | Client component: "Inscribirme gratis" si no inscrito, "Continuar curso" si activo, "Pendiente" si pendiente |
| `LessonSidebar.tsx` | Árbol módulos/lecciones. Checkmark (✓) en lecciones completadas. Link activo en lección actual |
| `LessonContent.tsx` | Renderiza `content_mdx` con `next-mdx-remote`. Embed YouTube si `youtube_video_id` presente. Botón "Marcar completada" |
| `ProgressBar.tsx` | "X de Y lecciones completadas" con barra visual |

### Layout de `/aprender`

```
┌──────────────────┬─────────────────────────────────┐
│  LessonSidebar   │  ProgressBar                     │
│  (módulos +      │  LessonContent (MDX)             │
│   lecciones +    │  + VideoPlayer (YouTube embed)   │
│   checkmarks)    │  + [✓ Marcar como completada]    │
└──────────────────┴─────────────────────────────────┘
```

La lección activa se determina por query param `?leccion=<id>`. Si no hay query param, se carga la primera lección del primer módulo.

**Reutilización:** `LessonContent` envuelve `MDXContent.tsx` existente sin modificarlo. Los estilos `.mdx-prose` de `globals.css` aplican directamente.

---

## i18n

Strings de UI para cursos en `src/messages/es.json` y `src/messages/en.json` bajo clave `cursos`:

```json
{
  "cursos": {
    "enroll": "Inscribirme gratis",
    "continuar": "Continuar curso",
    "pendiente": "Inscripción pendiente",
    "marcar_completada": "Marcar como completada",
    "completada": "Completada",
    "progreso": "{completed} de {total} lecciones completadas"
  }
}
```

El contenido de los cursos (títulos, descripción, MDX) es solo en español por ahora. La UI usa las traducciones.

---

## Testing

Vitest + RTL, co-localizados en `__tests__/`:

**Unit tests:**
- `src/lib/cursos/__tests__/enrollment.test.ts`
  - `checkActiveEnrollment`: status=approved + expires_at=null → true
  - `checkActiveEnrollment`: status=approved + expires_at en el pasado → false
  - `checkActiveEnrollment`: status=pending → false
- Tests de API routes (`enrollar`, `completar`, `contenido`) mockeando cliente Supabase, igual que `src/app/api/comments/__tests__/`

**Component tests:**
- `LessonSidebar`: renderiza módulos y lecciones; muestra ✓ solo en completadas
- `ProgressBar`: "3 de 10 lecciones completadas"
- `EnrollmentCTA`: variantes pending / approved / null

---

## Seed del primer curso

Script `scripts/seed-cursos.ts` para insertar "Personal Page Recipe" con sus 6 módulos directamente en Supabase vía `createAdminClient()`. No requiere UI de admin para el contenido inicial.

Módulos:
1. Setup & Herramientas
2. El Template Base
3. IA en tu Workflow
4. Personalización
5. Deploy & CI/CD
6. Variantes de Stack

---

## Archivos a crear / modificar

```
# Nuevos
supabase/migrations/005_cursos.sql
src/lib/cursos/types.ts
src/lib/cursos/enrollment.ts
src/lib/cursos/__tests__/enrollment.test.ts
src/components/cursos/CourseCard.tsx
src/components/cursos/EnrollmentCTA.tsx
src/components/cursos/LessonSidebar.tsx
src/components/cursos/LessonContent.tsx
src/components/cursos/ProgressBar.tsx
src/app/[locale]/cursos/page.tsx
src/app/[locale]/cursos/layout.tsx
src/app/[locale]/cursos/registro/page.tsx
src/app/[locale]/cursos/login/page.tsx
src/app/[locale]/cursos/mi-acceso/page.tsx
src/app/[locale]/cursos/[slug]/page.tsx
src/app/[locale]/cursos/[slug]/aprender/page.tsx
src/app/api/cursos/[slug]/enrollar/route.ts
src/app/api/cursos/[slug]/progreso/route.ts
src/app/api/cursos/[slug]/lecciones/[id]/completar/route.ts
src/app/api/cursos/[slug]/lecciones/[id]/contenido/route.ts
scripts/seed-cursos.ts

# Modificados
src/proxy.ts                    — agregar rutas protegidas de cursos
src/messages/es.json            — agregar clave "cursos"
src/messages/en.json            — agregar clave "cursos"
src/app/[locale]/layout.tsx     — agregar enlace /cursos al Nav (si aplica)
```
