# Imán MAPA + newsletter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar la plantilla del Método MAPA en `/mapa`, enviar el plan por correo, suscribir a la newsletter con consentimiento explícito y aceptar el tipo de contacto "Formación / taller".

**Architecture:** Supabase (`subscribers`) es la fuente de verdad; Resend envía el correo del plan y mantiene un Segment para Broadcasts. La lógica pura (armar plan, validar, persistir) vive en `src/lib/mapa/*` y se prueba sola; la UI es un client component con copia en `next-intl`.

**Tech Stack:** Next.js 16.2.4 App Router, next-intl 4, Supabase JS 2, Resend SDK 6.12, Zod 4, Tailwind 4, Vitest + RTL.

**Spec:** `docs/superpowers/specs/2026-10-15-mapa-newsletter-design.md`

## Global Constraints

- Todo texto visible vive en `src/messages/es.json` y `src/messages/en.json` (mismas claves en ambos).
- Navegación con `Link` de `@/i18n/navigation`, nunca de `next/navigation`.
- Rutas API usan `createAdminClient()`; nunca exponer service role al cliente.
- La casilla de newsletter arranca **sin marcar**; el plan se envía siempre.
- Variable de entorno del Segment: `RESEND_SEGMENT_ID` (enmienda a la spec: Resend v6 reemplazó Audiences por Segments).
- Baja en Resend = `contacts.update({ email, unsubscribed: true })` (enmienda: no se borra el contacto).
- URL base en correos: `https://www.sergiomonsalve.com`.
- Tests co-ubicados en `__tests__/`. Mock de `next-intl` como en `CLAUDE.md`; `vi.hoisted()` para variables usadas en factories.
- Commits terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Escáneres de enlaces en correos** (Outlook Safe Links, antivirus) abren el enlace de baja con GET → la baja **no** debe ejecutarse en GET; requiere botón de confirmación (POST por server action). Cubierto en Task 7.
2. **Correo con mayúsculas o espacios** (`  Ana@Mail.com `) → debe tratarse como el mismo suscriptor que `ana@mail.com`. Test en Task 3.
3. **Suscriptor dado de baja que vuelve y NO marca la casilla** → recibe el plan pero sigue dado de baja. Test en Task 4.
4. **Token de baja malformado** (`?token=abc`) → mensaje claro, sin error 500 de Postgres por UUID inválido. Test en Task 4.
5. **Resend devuelve `{ error }` en vez de lanzar** → el envío del plan debe detectarlo y responder 502, no "éxito". Test en Task 5.

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `supabase/migrations/006_subscribers.sql` | Tabla `subscribers` |
| `supabase/migrations/007_contact_training.sql` | Tipo `training` en contacto |
| `src/lib/contact-schema.ts` | `PROJECT_TYPES`, `parseProjectType` |
| `src/lib/mapa/plan.ts` | Tipos `MapaData`, `PlanCopy`; `buildPlan`, `buildMapPrompt`, `buildTutorPrompt` |
| `src/lib/mapa/schema.ts` | `planRequestSchema`, `isHoneypotFilled` |
| `src/lib/mapa/subscribers.ts` | `upsertSubscriber`, `unsubscribeByToken` |
| `src/lib/mapa/email-copy.ts` | Textos del correo del plan (es/en) |
| `src/lib/resend.ts` | + `sendPlanEmail`, `subscribeNewsletterContact`, `unsubscribeNewsletterContact` |
| `src/app/api/mapa/plan/route.ts` | Endpoint POST |
| `src/app/[locale]/(main)/newsletter/baja/page.tsx` + `actions.ts` | Confirmación y baja |
| `src/app/[locale]/(main)/mapa/page.tsx` | Página |
| `src/components/mapa/MapaTool.tsx` | Plantilla interactiva |
| `src/components/mapa/StationTimer.tsx` | Cronómetro de 5 min |
| `src/components/mapa/CopyButton.tsx` | Botón copiar con respaldo |
| `src/components/mapa/PlanEmailForm.tsx` | Formulario de correo |
| `src/app/[locale]/(main)/privacidad/page.tsx` | Política de datos |

---

### Task 1: Migraciones y enmienda de la spec

**Files:**
- Create: `supabase/migrations/006_subscribers.sql`, `supabase/migrations/007_contact_training.sql`
- Modify: `docs/superpowers/specs/2026-10-15-mapa-newsletter-design.md`

**Interfaces:**
- Produces: tabla `subscribers(id, email, name, locale, source, newsletter, consented_at, status, unsubscribe_token, created_at, unsubscribed_at)`; check de `project_type` con `'training'`.

- [ ] **Step 1: Crear `006_subscribers.sql`**

```sql
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
```

- [ ] **Step 2: Crear `007_contact_training.sql`**

```sql
alter table contact_submissions drop constraint contact_submissions_project_type_check;
alter table contact_submissions add constraint contact_submissions_project_type_check
  check (project_type in ('freelance', 'fulltime', 'collaboration', 'training'));
```

- [ ] **Step 3: Enmendar la spec** — reemplazar `RESEND_AUDIENCE_ID` por `RESEND_SEGMENT_ID`, "Audience" por "Segment", y en la sección 4 cambiar "quita el contacto de la Audience" por "marca el contacto como `unsubscribed` en Resend". Agregar en la sección 4: "La baja se ejecuta solo al confirmar con un botón (POST); el GET solo muestra la confirmación, para que los escáneres de enlaces no den de baja a nadie."

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/006_subscribers.sql supabase/migrations/007_contact_training.sql docs/superpowers/specs/2026-10-15-mapa-newsletter-design.md
git commit -m "feat(db): subscribers table and training contact type

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Tipo de contacto "Formación / taller"

**Files:**
- Modify: `src/lib/contact-schema.ts`, `src/components/ContactForm.tsx`, `src/app/[locale]/(main)/contact/page.tsx`, `src/messages/es.json`, `src/messages/en.json`
- Test: `src/lib/__tests__/contact-schema.test.ts`, `src/components/__tests__/ContactForm.test.tsx`

**Interfaces:**
- Produces: `PROJECT_TYPES: readonly ['freelance','fulltime','collaboration','training']`, `type ProjectType`, `parseProjectType(value: unknown): ProjectType | undefined`, prop `ContactForm({ initialType?: ProjectType })`.

- [ ] **Step 1: Tests que fallan** — en `contact-schema.test.ts` reemplazar el test "accepts all three project types" por:

```ts
  it('accepts all four project types', () => {
    for (const type of PROJECT_TYPES) {
      const result = contactSchema.safeParse({ ...valid, projectType: type })
      expect(result.success).toBe(true)
    }
  })

  it('parseProjectType returns a valid type or undefined', () => {
    expect(parseProjectType('training')).toBe('training')
    expect(parseProjectType('hacker')).toBeUndefined()
    expect(parseProjectType(undefined)).toBeUndefined()
    expect(parseProjectType(['training'])).toBeUndefined()
  })
```

y cambiar el import a `import { contactSchema, PROJECT_TYPES, parseProjectType } from '../contact-schema'`.

En `ContactForm.test.tsx` agregar `'projectTypes.training': 'Formación / taller',` al mapa del mock y estos tests:

```ts
  it('renders the training project type', () => {
    render(<ContactForm />)
    expect(screen.getByRole('button', { name: 'Formación / taller' })).toBeInTheDocument()
  })

  it('preselects the initial project type', () => {
    render(<ContactForm initialType="training" />)
    expect(screen.getByRole('button', { name: 'Formación / taller' })).toHaveAttribute('data-active', 'true')
  })
```

- [ ] **Step 2: Correr y ver fallar**

Run: `npx vitest run src/lib/__tests__/contact-schema.test.ts src/components/__tests__/ContactForm.test.tsx`
Expected: FAIL (`PROJECT_TYPES` no exportado; botón no encontrado).

- [ ] **Step 3: Implementar** — `src/lib/contact-schema.ts`:

```ts
import { z } from 'zod'

export const PROJECT_TYPES = ['freelance', 'fulltime', 'collaboration', 'training'] as const
export type ProjectType = (typeof PROJECT_TYPES)[number]

export function parseProjectType(value: unknown): ProjectType | undefined {
  return typeof value === 'string' && (PROJECT_TYPES as readonly string[]).includes(value)
    ? (value as ProjectType)
    : undefined
}

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  projectType: z.enum(PROJECT_TYPES),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

export type ContactFormData = z.infer<typeof contactSchema>
```

En `ContactForm.tsx` reemplazar las líneas 6–12 por:

```tsx
import { PROJECT_TYPES, type ProjectType } from '@/lib/contact-schema'

export default function ContactForm({ initialType }: { initialType?: ProjectType } = {}) {
  const t = useTranslations('contact')
  const [projectType, setProjectType] = useState<ProjectType | null>(initialType ?? null)
```

(el `import` va arriba junto a los demás; eliminar el `type ProjectType` y la constante `PROJECT_TYPES` locales).

En `contact/page.tsx` cambiar la firma y el render:

```tsx
import { parseProjectType } from '@/lib/contact-schema'
// ...
export default async function ContactPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ tipo?: string | string[] }>
}) {
  const { locale } = await params
  const { tipo } = await searchParams
  const t = await getTranslations({ locale, namespace: 'contact' })
  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <p className="font-mono text-xs text-text-muted mb-3">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">
        {t('title')}
      </h1>
      <ContactForm initialType={parseProjectType(tipo)} />
    </div>
  )
}
```

Mensajes: en `contact.projectTypes` agregar `"training": "Formación / taller"` (es) y `"training": "Training / workshop"` (en).

- [ ] **Step 4: Correr y ver pasar**

Run: `npx vitest run src/lib/__tests__/contact-schema.test.ts src/components/__tests__/ContactForm.test.tsx src/app/api/contact`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/contact-schema.ts src/lib/__tests__/contact-schema.test.ts src/components/ContactForm.tsx src/components/__tests__/ContactForm.test.tsx "src/app/[locale]/(main)/contact/page.tsx" src/messages/es.json src/messages/en.json
git commit -m "feat(contact): training project type with preselection

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Armado del plan, prompts y validación

**Files:**
- Create: `src/lib/mapa/plan.ts`, `src/lib/mapa/schema.ts`
- Modify: `src/messages/es.json`, `src/messages/en.json` (namespace `mapa.plan` y `mapa.example` y `mapa.days`)
- Test: `src/lib/mapa/__tests__/plan.test.ts`, `src/lib/mapa/__tests__/schema.test.ts`

**Interfaces:**
- Produces:
  - `type MapaPiece = { text: string; key: boolean }`
  - `type MapaData = { skill: string; outcome: string; why: string; hours: string; project: string; firstStep: string; weak: string; drill: string; recall: string; feedback: string; reviewDay: string; pieces: MapaPiece[] }`
  - `type PlanCopy` (forma de `mapa.plan` en mensajes)
  - `fill(template: string, vars: Record<string, string>): string`
  - `buildPlan(data: MapaData, copy: PlanCopy): string`, `buildMapPrompt(data, copy): string`, `buildTutorPrompt(data, copy): string`
  - `planRequestSchema` (Zod) → `{ email, name, locale: 'es'|'en', plan, newsletter }`; `type PlanRequest`; `isHoneypotFilled(body: unknown): boolean`

- [ ] **Step 1: Agregar mensajes** — en `es.json`, nuevo namespace de primer nivel `"mapa"` (antes de `"cursos"`) con, por ahora, `days`, `example` y `plan`:

```json
"mapa": {
  "days": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
  "example": {
    "skill": "SQL para analizar ventas",
    "outcome": "Armar yo solo el reporte mensual de ventas sin pedirle ayuda a TI",
    "why": "En enero asumo los reportes del área",
    "hours": "3",
    "project": "Un tablero con las ventas por región del último trimestre, hecho con consultas propias",
    "firstStep": "Instalar DBeaver y conectarme a la base de prueba",
    "weak": "Entender los JOIN entre varias tablas",
    "drill": "10 ejercicios cortos de JOIN, 15 minutos al día",
    "recall": "¿Cuándo uso LEFT JOIN en vez de INNER JOIN?\n¿Qué hace GROUP BY con los NULL?\n¿Cómo filtro después de agrupar?",
    "feedback": "La analista senior del equipo + la IA como tutor",
    "reviewDay": "Viernes",
    "pieces": [
      { "text": "SELECT, WHERE y ORDER BY", "key": true },
      { "text": "JOIN entre tablas", "key": true },
      { "text": "GROUP BY y agregaciones", "key": true },
      { "text": "Subconsultas", "key": false },
      { "text": "Funciones de fecha", "key": false },
      { "text": "Índices y rendimiento", "key": false }
    ]
  },
  "plan": {
    "heading": "PLAN MAPA · 30 DÍAS",
    "skill": "Habilidad",
    "goal": "Meta",
    "why": "Por qué ahora",
    "time": "Tiempo: {hours} h/semana · revisión cada {day}",
    "mapHeading": "M · PIEZAS CLAVE (el 20% que importa)",
    "keyMissing": "[marca tus 3 piezas clave]",
    "later": "Después",
    "applyHeading": "A · PROYECTO REAL",
    "today": "Hoy",
    "practiceHeading": "P · PRÁCTICA DE LO DIFÍCIL",
    "weak": "Punto débil",
    "drill": "Ejercicio",
    "recall": "Autoexamen semanal",
    "adjustHeading": "A · AJUSTE",
    "feedback": "Feedback",
    "weeksHeading": "SEMANAS",
    "week1": "{piece} + primera versión del proyecto",
    "week2": "{piece} + práctica del punto débil",
    "week3": "{piece} + integrar todo en el proyecto",
    "week4": "Terminar, mostrar el resultado y pedir feedback",
    "fallbackPieces": ["pieza clave 1", "pieza clave 2", "pieza clave 3"],
    "missing": {
      "skill": "[tu habilidad]",
      "outcome": "[tu resultado]",
      "project": "[tu proyecto]",
      "firstStep": "[tu primer paso]",
      "weak": "[tu punto débil]",
      "drill": "[tu ejercicio]",
      "feedback": "[quién te corrige]"
    },
    "mapPrompt": "Actúa como un experto en {skill} y como profesor.\nMi meta en 30 días: {outcome}.\nTengo {hours} horas por semana.\n\n1. Descompón la habilidad en 10 a 15 piezas concretas (conceptos, procedimientos y herramientas).\n2. Marca las 3 piezas que más acercan a mi meta y explica por qué.\n3. Dime qué puedo ignorar por ahora sin afectar el resultado.",
    "tutorPrompt": "Eres mi tutor de {skill}. Mi meta: {outcome}.\nCada vez que te escriba, hazme 3 preguntas de memoria sobre {topics},\nuna a la vez y sin darme la respuesta. Después de cada respuesta, corrígeme,\ndime qué error de razonamiento cometí y propónme un ejercicio corto para practicar ese punto.",
    "tutorTopicsFallback": "lo que estoy aprendiendo"
  }
}
```

En `en.json` el mismo bloque traducido:

```json
"mapa": {
  "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "example": {
    "skill": "SQL for sales analysis",
    "outcome": "Build the monthly sales report on my own without asking IT for help",
    "why": "I take over the team's reports in January",
    "hours": "3",
    "project": "A dashboard with last quarter's sales by region, built with my own queries",
    "firstStep": "Install DBeaver and connect to the test database",
    "weak": "Understanding JOINs across several tables",
    "drill": "10 short JOIN exercises, 15 minutes a day",
    "recall": "When do I use LEFT JOIN instead of INNER JOIN?\nWhat does GROUP BY do with NULLs?\nHow do I filter after grouping?",
    "feedback": "The team's senior analyst + AI as a tutor",
    "reviewDay": "Friday",
    "pieces": [
      { "text": "SELECT, WHERE and ORDER BY", "key": true },
      { "text": "JOINs between tables", "key": true },
      { "text": "GROUP BY and aggregates", "key": true },
      { "text": "Subqueries", "key": false },
      { "text": "Date functions", "key": false },
      { "text": "Indexes and performance", "key": false }
    ]
  },
  "plan": {
    "heading": "MAPA PLAN · 30 DAYS",
    "skill": "Skill",
    "goal": "Goal",
    "why": "Why now",
    "time": "Time: {hours} h/week · review every {day}",
    "mapHeading": "M · KEY PIECES (the 20% that matters)",
    "keyMissing": "[star your 3 key pieces]",
    "later": "Later",
    "applyHeading": "A · REAL PROJECT",
    "today": "Today",
    "practiceHeading": "P · PRACTICE THE HARD PARTS",
    "weak": "Weak spot",
    "drill": "Drill",
    "recall": "Weekly self-test",
    "adjustHeading": "A · ADJUST",
    "feedback": "Feedback",
    "weeksHeading": "WEEKS",
    "week1": "{piece} + first version of the project",
    "week2": "{piece} + practice the weak spot",
    "week3": "{piece} + bring it all into the project",
    "week4": "Finish, show the result and ask for feedback",
    "fallbackPieces": ["key piece 1", "key piece 2", "key piece 3"],
    "missing": {
      "skill": "[your skill]",
      "outcome": "[your result]",
      "project": "[your project]",
      "firstStep": "[your first step]",
      "weak": "[your weak spot]",
      "drill": "[your drill]",
      "feedback": "[who corrects you]"
    },
    "mapPrompt": "Act as an expert in {skill} and as a teacher.\nMy 30-day goal: {outcome}.\nI have {hours} hours per week.\n\n1. Break the skill into 10 to 15 concrete pieces (concepts, procedures and tools).\n2. Mark the 3 pieces that bring me closest to my goal and explain why.\n3. Tell me what I can ignore for now without hurting the result.",
    "tutorPrompt": "You are my {skill} tutor. My goal: {outcome}.\nEvery time I write to you, ask me 3 recall questions about {topics},\none at a time and without giving me the answer. After each answer, correct me,\ntell me what reasoning mistake I made and suggest a short exercise to practice that point.",
    "tutorTopicsFallback": "what I'm learning"
  }
}
```

- [ ] **Step 2: Tests que fallan** — `src/lib/mapa/__tests__/plan.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import es from '@/messages/es.json'
import en from '@/messages/en.json'
import { buildPlan, buildMapPrompt, buildTutorPrompt, fill, type MapaData, type PlanCopy } from '../plan'

const esCopy = es.mapa.plan as PlanCopy
const enCopy = en.mapa.plan as PlanCopy
const example = es.mapa.example as MapaData

const empty: MapaData = {
  skill: '', outcome: '', why: '', hours: '3', project: '', firstStep: '', weak: '',
  drill: '', recall: '', feedback: '', reviewDay: 'Viernes', pieces: [{ text: '', key: false }]
}

describe('fill', () => {
  it('replaces every placeholder and leaves unknown ones', () => {
    expect(fill('{a} y {a} con {b} {c}', { a: 'x', b: 'y' })).toBe('x y x con y {c}')
  })
})

describe('buildPlan', () => {
  it('builds the full plan from the example', () => {
    const plan = buildPlan(example, esCopy)
    expect(plan).toContain('PLAN MAPA · 30 DÍAS')
    expect(plan).toContain('Habilidad: SQL para analizar ventas')
    expect(plan).toContain('Tiempo: 3 h/semana · revisión cada viernes')
    expect(plan).toContain('  ★ JOIN entre tablas')
    expect(plan).toContain('  Después: Subconsultas, Funciones de fecha, Índices y rendimiento')
    expect(plan).toContain('    · ¿Qué hace GROUP BY con los NULL?')
    expect(plan).toContain('  1 · SELECT, WHERE y ORDER BY + primera versión del proyecto')
    expect(plan).toContain('  3 · GROUP BY y agregaciones + integrar todo en el proyecto')
  })

  it('uses placeholders when fields are empty', () => {
    const plan = buildPlan(empty, esCopy)
    expect(plan).toContain('Habilidad: [tu habilidad]')
    expect(plan).toContain('  ★ [marca tus 3 piezas clave]')
    expect(plan).toContain('  1 · pieza clave 1 + primera versión del proyecto')
    expect(plan).not.toContain('Por qué ahora')
    expect(plan).not.toContain('Después:')
  })

  it('reuses the last key piece when fewer than three are starred', () => {
    const plan = buildPlan({ ...empty, pieces: [{ text: 'JOIN', key: true }] }, esCopy)
    expect(plan).toContain('  2 · JOIN + práctica del punto débil')
    expect(plan).toContain('  3 · JOIN + integrar todo en el proyecto')
  })

  it('ignores starred pieces with empty text', () => {
    const plan = buildPlan({ ...empty, pieces: [{ text: '  ', key: true }] }, esCopy)
    expect(plan).toContain('[marca tus 3 piezas clave]')
  })

  it('works in English', () => {
    const plan = buildPlan({ ...(en.mapa.example as MapaData) }, enCopy)
    expect(plan).toContain('MAPA PLAN · 30 DAYS')
    expect(plan).toContain('review every friday')
  })
})

describe('prompts', () => {
  it('fills the map prompt with skill, outcome and hours', () => {
    const prompt = buildMapPrompt(example, esCopy)
    expect(prompt).toContain('experto en SQL para analizar ventas')
    expect(prompt).toContain('Tengo 3 horas por semana')
  })

  it('lists key pieces as tutor topics, or a fallback', () => {
    expect(buildTutorPrompt(example, esCopy)).toContain('sobre SELECT, WHERE y ORDER BY, JOIN entre tablas, GROUP BY y agregaciones,')
    expect(buildTutorPrompt(empty, esCopy)).toContain('sobre lo que estoy aprendiendo,')
  })
})
```

`src/lib/mapa/__tests__/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { planRequestSchema, isHoneypotFilled } from '../schema'

const valid = { email: 'ana@example.com', name: 'Ana', locale: 'es', plan: 'PLAN MAPA', newsletter: false }

describe('planRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(planRequestSchema.safeParse(valid).success).toBe(true)
  })

  it('normalizes email casing and spaces', () => {
    const r = planRequestSchema.parse({ ...valid, email: '  Ana@Example.COM ' })
    expect(r.email).toBe('ana@example.com')
  })

  it('defaults name to empty string and trims it', () => {
    expect(planRequestSchema.parse({ ...valid, name: undefined }).name).toBe('')
    expect(planRequestSchema.parse({ ...valid, name: '  Ana ' }).name).toBe('Ana')
  })

  it.each([
    ['bad email', { email: 'nope' }],
    ['empty plan', { plan: '' }],
    ['plan too long', { plan: 'x'.repeat(6001) }],
    ['unknown locale', { locale: 'fr' }],
    ['newsletter as string', { newsletter: 'true' }],
    ['name too long', { name: 'x'.repeat(81) }]
  ])('rejects %s', (_label, patch) => {
    expect(planRequestSchema.safeParse({ ...valid, ...patch }).success).toBe(false)
  })
})

describe('isHoneypotFilled', () => {
  it('detects a filled website field', () => {
    expect(isHoneypotFilled({ website: 'http://spam' })).toBe(true)
    expect(isHoneypotFilled({ website: '' })).toBe(false)
    expect(isHoneypotFilled({})).toBe(false)
    expect(isHoneypotFilled(null)).toBe(false)
  })
})
```

- [ ] **Step 3: Correr y ver fallar**

Run: `npx vitest run src/lib/mapa`
Expected: FAIL (módulos `../plan` y `../schema` no existen).

- [ ] **Step 4: Implementar** — `src/lib/mapa/plan.ts`:

```ts
export type MapaPiece = { text: string; key: boolean }

export type MapaData = {
  skill: string
  outcome: string
  why: string
  hours: string
  project: string
  firstStep: string
  weak: string
  drill: string
  recall: string
  feedback: string
  reviewDay: string
  pieces: MapaPiece[]
}

export type PlanCopy = {
  heading: string
  skill: string
  goal: string
  why: string
  time: string
  mapHeading: string
  keyMissing: string
  later: string
  applyHeading: string
  today: string
  practiceHeading: string
  weak: string
  drill: string
  recall: string
  adjustHeading: string
  feedback: string
  weeksHeading: string
  week1: string
  week2: string
  week3: string
  week4: string
  fallbackPieces: string[]
  missing: Record<'skill' | 'outcome' | 'project' | 'firstStep' | 'weak' | 'drill' | 'feedback', string>
  mapPrompt: string
  tutorPrompt: string
  tutorTopicsFallback: string
}

export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? vars[name] : match))
}

function or(value: string, fallback: string) {
  return value.trim() || fallback
}

function keyPieces(data: MapaData) {
  return data.pieces.filter(p => p.key && p.text.trim()).map(p => p.text.trim())
}

function otherPieces(data: MapaData) {
  return data.pieces.filter(p => !p.key && p.text.trim()).map(p => p.text.trim())
}

export function buildPlan(data: MapaData, copy: PlanCopy): string {
  const keys = keyPieces(data)
  const others = otherPieces(data)
  const recall = data.recall.split('\n').map(s => s.trim()).filter(Boolean)
  const lines: string[] = []

  lines.push(copy.heading)
  lines.push(`${copy.skill}: ${or(data.skill, copy.missing.skill)}`)
  lines.push(`${copy.goal}: ${or(data.outcome, copy.missing.outcome)}`)
  if (data.why.trim()) lines.push(`${copy.why}: ${data.why.trim()}`)
  lines.push(fill(copy.time, { hours: data.hours, day: data.reviewDay.toLowerCase() }))
  lines.push('')
  lines.push(copy.mapHeading)
  if (keys.length) keys.forEach(k => lines.push(`  ★ ${k}`))
  else lines.push(`  ★ ${copy.keyMissing}`)
  if (others.length) lines.push(`  ${copy.later}: ${others.join(', ')}`)
  lines.push('')
  lines.push(copy.applyHeading)
  lines.push(`  ${or(data.project, copy.missing.project)}`)
  lines.push(`  ${copy.today}: ${or(data.firstStep, copy.missing.firstStep)}`)
  lines.push('')
  lines.push(copy.practiceHeading)
  lines.push(`  ${copy.weak}: ${or(data.weak, copy.missing.weak)}`)
  lines.push(`  ${copy.drill}: ${or(data.drill, copy.missing.drill)}`)
  if (recall.length) {
    lines.push(`  ${copy.recall}:`)
    recall.forEach(q => lines.push(`    · ${q}`))
  }
  lines.push('')
  lines.push(copy.adjustHeading)
  lines.push(`  ${copy.feedback}: ${or(data.feedback, copy.missing.feedback)}`)
  lines.push('')
  const k = keys.length ? keys : copy.fallbackPieces
  lines.push(copy.weeksHeading)
  lines.push(`  1 · ${fill(copy.week1, { piece: k[0] })}`)
  lines.push(`  2 · ${fill(copy.week2, { piece: k[1] ?? k[k.length - 1] })}`)
  lines.push(`  3 · ${fill(copy.week3, { piece: k[2] ?? k[k.length - 1] })}`)
  lines.push(`  4 · ${copy.week4}`)
  return lines.join('\n')
}

export function buildMapPrompt(data: MapaData, copy: PlanCopy): string {
  return fill(copy.mapPrompt, {
    skill: or(data.skill, copy.missing.skill),
    outcome: or(data.outcome, copy.missing.outcome),
    hours: data.hours
  })
}

export function buildTutorPrompt(data: MapaData, copy: PlanCopy): string {
  const keys = keyPieces(data)
  return fill(copy.tutorPrompt, {
    skill: or(data.skill, copy.missing.skill),
    outcome: or(data.outcome, copy.missing.outcome),
    topics: keys.length ? keys.join(', ') : copy.tutorTopicsFallback
  })
}
```

`src/lib/mapa/schema.ts`:

```ts
import { z } from 'zod'

export const planRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().max(80).optional().default(''),
  locale: z.enum(['es', 'en']),
  plan: z.string().min(1).max(6000),
  newsletter: z.boolean()
})

export type PlanRequest = z.infer<typeof planRequestSchema>

export function isHoneypotFilled(body: unknown): boolean {
  if (!body || typeof body !== 'object' || !('website' in body)) return false
  const value = (body as { website: unknown }).website
  return typeof value === 'string' && value.trim() !== ''
}
```

- [ ] **Step 5: Correr y ver pasar**

Run: `npx vitest run src/lib/mapa`
Expected: PASS (todos)

- [ ] **Step 6: Commit**

```bash
git add src/lib/mapa src/messages/es.json src/messages/en.json
git commit -m "feat(mapa): plan builder, prompts and request schema

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Persistencia de suscriptores

**Files:**
- Create: `src/lib/mapa/subscribers.ts`
- Test: `src/lib/mapa/__tests__/subscribers.test.ts`

**Interfaces:**
- Consumes: `createAdminClient()` de `@/lib/supabase/server`.
- Produces:
  - `upsertSubscriber(input: { email: string; name: string; locale: 'es' | 'en'; newsletter: boolean }): Promise<{ unsubscribeToken: string }>` — lanza `Error` si Supabase falla.
  - `unsubscribeByToken(token: string): Promise<{ email: string } | null>` — `null` si el token es inválido o no existe; lanza si Supabase falla.

- [ ] **Step 1: Tests que fallan** — `src/lib/mapa/__tests__/subscribers.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { upsertSubscriber, unsubscribeByToken } from '../subscribers'

type Result = { data: unknown; error: unknown }
type Call = { table: string; method: string; args: unknown[] }

const { state } = vi.hoisted(() => ({
  state: { results: [] as Result[], calls: [] as Call[] }
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      const result = state.results.shift() ?? { data: null, error: null }
      const q: Record<string, unknown> = {}
      for (const method of ['select', 'insert', 'update', 'eq']) {
        q[method] = (...args: unknown[]) => {
          state.calls.push({ table, method, args })
          return q
        }
      }
      q.maybeSingle = async () => result
      q.single = async () => result
      q.then = (resolve: (r: Result) => unknown) => resolve(result)
      return q
    }
  })
}))

const TOKEN = '6f1c2a5e-8d1b-4c3a-9e2f-0a1b2c3d4e5f'
const findCall = (method: string) => state.calls.find(c => c.method === method)

describe('upsertSubscriber', () => {
  beforeEach(() => {
    state.results = []
    state.calls = []
  })

  it('inserts a new subscriber with consent when newsletter is true', async () => {
    state.results = [
      { data: null, error: null },
      { data: { unsubscribe_token: TOKEN }, error: null }
    ]
    const r = await upsertSubscriber({ email: 'ana@example.com', name: 'Ana', locale: 'es', newsletter: true })
    expect(r.unsubscribeToken).toBe(TOKEN)
    const row = findCall('insert')!.args[0] as Record<string, unknown>
    expect(row).toMatchObject({ email: 'ana@example.com', name: 'Ana', locale: 'es', source: 'mapa', newsletter: true })
    expect(row.consented_at).toEqual(expect.any(String))
  })

  it('inserts without consent when newsletter is false', async () => {
    state.results = [
      { data: null, error: null },
      { data: { unsubscribe_token: TOKEN }, error: null }
    ]
    await upsertSubscriber({ email: 'ana@example.com', name: '', locale: 'es', newsletter: false })
    const row = findCall('insert')!.args[0] as Record<string, unknown>
    expect(row).toMatchObject({ newsletter: false, consented_at: null, name: null })
  })

  it('reactivates an unsubscribed person who opts in again', async () => {
    state.results = [
      { data: { id: 'id-1', unsubscribe_token: TOKEN }, error: null },
      { data: null, error: null }
    ]
    await upsertSubscriber({ email: 'ana@example.com', name: 'Ana', locale: 'en', newsletter: true })
    const patch = findCall('update')!.args[0] as Record<string, unknown>
    expect(patch).toMatchObject({ locale: 'en', newsletter: true, status: 'active', unsubscribed_at: null, name: 'Ana' })
  })

  it('does not touch the subscription of a returning person who does not opt in', async () => {
    state.results = [
      { data: { id: 'id-1', unsubscribe_token: TOKEN }, error: null },
      { data: null, error: null }
    ]
    const r = await upsertSubscriber({ email: 'ana@example.com', name: '', locale: 'es', newsletter: false })
    expect(r.unsubscribeToken).toBe(TOKEN)
    const patch = findCall('update')!.args[0] as Record<string, unknown>
    expect(patch).toEqual({ locale: 'es' })
  })

  it('throws when Supabase fails', async () => {
    state.results = [{ data: null, error: { message: 'boom' } }]
    await expect(
      upsertSubscriber({ email: 'ana@example.com', name: '', locale: 'es', newsletter: false })
    ).rejects.toThrow('boom')
  })
})

describe('unsubscribeByToken', () => {
  beforeEach(() => {
    state.results = []
    state.calls = []
  })

  it('returns null for a malformed token without querying', async () => {
    expect(await unsubscribeByToken('abc')).toBeNull()
    expect(state.calls).toHaveLength(0)
  })

  it('marks the subscriber as unsubscribed and returns the email', async () => {
    state.results = [{ data: { email: 'ana@example.com' }, error: null }]
    expect(await unsubscribeByToken(TOKEN)).toEqual({ email: 'ana@example.com' })
    const patch = findCall('update')!.args[0] as Record<string, unknown>
    expect(patch).toMatchObject({ status: 'unsubscribed', newsletter: false })
    expect(findCall('eq')!.args).toEqual(['unsubscribe_token', TOKEN])
  })

  it('returns null when the token does not exist', async () => {
    state.results = [{ data: null, error: null }]
    expect(await unsubscribeByToken(TOKEN)).toBeNull()
  })
})
```

- [ ] **Step 2: Correr y ver fallar**

Run: `npx vitest run src/lib/mapa/__tests__/subscribers.test.ts`
Expected: FAIL (módulo no existe).

- [ ] **Step 3: Implementar** — `src/lib/mapa/subscribers.ts`:

```ts
import { createAdminClient } from '@/lib/supabase/server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type SubscriberInput = {
  email: string
  name: string
  locale: 'es' | 'en'
  newsletter: boolean
}

export async function upsertSubscriber(input: SubscriberInput): Promise<{ unsubscribeToken: string }> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data: existing, error: findError } = await supabase
    .from('subscribers')
    .select('id, unsubscribe_token')
    .eq('email', input.email)
    .maybeSingle()
  if (findError) throw new Error(findError.message)

  if (!existing) {
    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        email: input.email,
        name: input.name || null,
        locale: input.locale,
        source: 'mapa',
        newsletter: input.newsletter,
        consented_at: input.newsletter ? now : null
      })
      .select('unsubscribe_token')
      .single()
    if (error) throw new Error(error.message)
    return { unsubscribeToken: data.unsubscribe_token }
  }

  const patch: Record<string, unknown> = { locale: input.locale }
  if (input.name) patch.name = input.name
  if (input.newsletter) {
    Object.assign(patch, { newsletter: true, status: 'active', consented_at: now, unsubscribed_at: null })
  }
  const { error } = await supabase.from('subscribers').update(patch).eq('id', existing.id)
  if (error) throw new Error(error.message)
  return { unsubscribeToken: existing.unsubscribe_token }
}

export async function unsubscribeByToken(token: string): Promise<{ email: string } | null> {
  if (!UUID.test(token)) return null
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('subscribers')
    .update({ status: 'unsubscribed', newsletter: false, unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select('email')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? { email: data.email } : null
}
```

- [ ] **Step 4: Correr y ver pasar**

Run: `npx vitest run src/lib/mapa/__tests__/subscribers.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mapa/subscribers.ts src/lib/mapa/__tests__/subscribers.test.ts
git commit -m "feat(mapa): subscriber upsert and token unsubscribe

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Correos con Resend

**Files:**
- Create: `src/lib/mapa/email-copy.ts`
- Modify: `src/lib/resend.ts`
- Test: `src/lib/__tests__/resend-mapa.test.ts`

**Interfaces:**
- Produces:
  - `sendPlanEmail(d: { to: string; name: string; locale: 'es' | 'en'; plan: string; unsubscribeUrl: string }): Promise<void>` — lanza si Resend devuelve `error`.
  - `subscribeNewsletterContact(email: string, name: string): Promise<void>` — no-op sin `RESEND_SEGMENT_ID`.
  - `unsubscribeNewsletterContact(email: string): Promise<void>` — no-op sin `RESEND_SEGMENT_ID`.

- [ ] **Step 1: Tests que fallan** — `src/lib/__tests__/resend-mapa.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { send, create, update, addSegment } = vi.hoisted(() => ({
  send: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  addSegment: vi.fn()
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
    contacts = { create, update, segments: { add: addSegment } }
  }
}))

import { sendPlanEmail, subscribeNewsletterContact, unsubscribeNewsletterContact } from '../resend'

const planData = {
  to: 'ana@example.com',
  name: 'Ana',
  locale: 'es' as const,
  plan: 'PLAN <MAPA> & más',
  unsubscribeUrl: 'https://www.sergiomonsalve.com/es/newsletter/baja?token=t'
}

describe('sendPlanEmail', () => {
  beforeEach(() => {
    send.mockReset()
    send.mockResolvedValue({ data: { id: '1' }, error: null })
  })

  it('sends the plan with an unsubscribe link and escaped HTML', async () => {
    await sendPlanEmail(planData)
    const args = send.mock.calls[0][0]
    expect(args.to).toBe('ana@example.com')
    expect(args.subject).toBe('Tu plan MAPA de 30 días')
    expect(args.text).toContain('PLAN <MAPA> & más')
    expect(args.text).toContain(planData.unsubscribeUrl)
    expect(args.html).toContain('PLAN &lt;MAPA&gt; &amp; más')
    expect(args.html).toContain(planData.unsubscribeUrl)
  })

  it('uses English copy for en', async () => {
    await sendPlanEmail({ ...planData, locale: 'en' })
    expect(send.mock.calls[0][0].subject).toBe('Your 30-day MAPA plan')
  })

  it('throws when Resend returns an error object', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'domain not verified' } })
    await expect(sendPlanEmail(planData)).rejects.toThrow('domain not verified')
  })
})

describe('newsletter contacts', () => {
  beforeEach(() => {
    create.mockReset()
    update.mockReset()
    addSegment.mockReset()
    create.mockResolvedValue({ data: { id: 'c1' }, error: null })
    update.mockResolvedValue({ data: { id: 'c1' }, error: null })
    addSegment.mockResolvedValue({ data: { id: 's1' }, error: null })
    vi.stubEnv('RESEND_SEGMENT_ID', 'seg_123')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('creates the contact inside the segment', async () => {
    await subscribeNewsletterContact('ana@example.com', 'Ana')
    expect(create).toHaveBeenCalledWith({
      email: 'ana@example.com',
      firstName: 'Ana',
      unsubscribed: false,
      segments: [{ id: 'seg_123' }]
    })
    expect(update).not.toHaveBeenCalled()
  })

  it('falls back to update + add segment when the contact exists', async () => {
    create.mockResolvedValue({ data: null, error: { message: 'Contact already exists' } })
    await subscribeNewsletterContact('ana@example.com', '')
    expect(update).toHaveBeenCalledWith({ email: 'ana@example.com', unsubscribed: false })
    expect(addSegment).toHaveBeenCalledWith({ email: 'ana@example.com', segmentId: 'seg_123' })
  })

  it('marks the contact as unsubscribed', async () => {
    await unsubscribeNewsletterContact('ana@example.com')
    expect(update).toHaveBeenCalledWith({ email: 'ana@example.com', unsubscribed: true })
  })

  it('does nothing without RESEND_SEGMENT_ID', async () => {
    vi.stubEnv('RESEND_SEGMENT_ID', '')
    await subscribeNewsletterContact('ana@example.com', 'Ana')
    await unsubscribeNewsletterContact('ana@example.com')
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Correr y ver fallar**

Run: `npx vitest run src/lib/__tests__/resend-mapa.test.ts`
Expected: FAIL (`sendPlanEmail` no exportado).

- [ ] **Step 3: Implementar** — `src/lib/mapa/email-copy.ts`:

```ts
export const planEmailCopy = {
  es: {
    subject: 'Tu plan MAPA de 30 días',
    greeting: (name: string) => (name ? `Hola, ${name}:` : 'Hola:'),
    intro: 'Aquí está el plan que armaste con la plantilla del Método MAPA. Guárdalo en tus notas y ponle fecha de inicio.',
    outro: 'Si quieres aplicar el método con tu equipo o en una cohorte en vivo, responde este correo o visita https://www.sergiomonsalve.com/es/formacion',
    signature: 'Sergio Monsalve',
    unsubscribe: 'No quiero recibir más correos'
  },
  en: {
    subject: 'Your 30-day MAPA plan',
    greeting: (name: string) => (name ? `Hi ${name},` : 'Hi,'),
    intro: 'Here is the plan you built with the MAPA Method template. Save it in your notes and give it a start date.',
    outro: 'If you want to apply the method with your team or in a live cohort, reply to this email or visit https://www.sergiomonsalve.com/en/formacion',
    signature: 'Sergio Monsalve',
    unsubscribe: 'Stop receiving emails'
  }
} as const
```

En `src/lib/resend.ts` agregar al final:

```ts
import { planEmailCopy } from './mapa/email-copy'

export type PlanEmailData = {
  to: string
  name: string
  locale: 'es' | 'en'
  plan: string
  unsubscribeUrl: string
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function sendPlanEmail(d: PlanEmailData) {
  const c = planEmailCopy[d.locale]
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const { error } = await resend.emails.send({
    from: FROM,
    to: d.to,
    replyTo: process.env.CONTACT_EMAIL,
    subject: c.subject,
    text: [c.greeting(d.name), '', c.intro, '', d.plan, '', c.outro, '', c.signature, '', `${c.unsubscribe}: ${d.unsubscribeUrl}`].join('\n'),
    html: [
      `<p>${escapeHtml(c.greeting(d.name))}</p>`,
      `<p>${escapeHtml(c.intro)}</p>`,
      `<pre style="font-family:Menlo,Consolas,monospace;font-size:13px;line-height:1.6;background:#f4f1ea;padding:16px;border-radius:4px;white-space:pre-wrap">${escapeHtml(d.plan)}</pre>`,
      `<p>${escapeHtml(c.outro)}</p>`,
      `<p>${escapeHtml(c.signature)}</p>`,
      `<p style="font-size:12px;color:#777"><a href="${escapeHtml(d.unsubscribeUrl)}">${escapeHtml(c.unsubscribe)}</a></p>`
    ].join('\n'),
    headers: { 'List-Unsubscribe': `<${d.unsubscribeUrl}>` }
  })
  if (error) throw new Error(error.message)
}

export async function subscribeNewsletterContact(email: string, name: string) {
  const segmentId = process.env.RESEND_SEGMENT_ID
  if (!segmentId) return
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const created = await resend.contacts.create({
    email,
    firstName: name || undefined,
    unsubscribed: false,
    segments: [{ id: segmentId }]
  })
  if (!created.error) return
  const updated = await resend.contacts.update({ email, unsubscribed: false })
  if (updated.error) throw new Error(updated.error.message)
  const added = await resend.contacts.segments.add({ email, segmentId })
  if (added.error) throw new Error(added.error.message)
}

export async function unsubscribeNewsletterContact(email: string) {
  if (!process.env.RESEND_SEGMENT_ID) return
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const { error } = await resend.contacts.update({ email, unsubscribed: true })
  if (error) throw new Error(error.message)
}
```

(Mover el `import { planEmailCopy }` arriba con los demás imports. Si `create` rechaza `firstName: undefined` en tipos, construir el objeto con spread condicional `...(name ? { firstName: name } : {})` y ajustar el test a `expect.objectContaining`.)

- [ ] **Step 4: Correr y ver pasar**

Run: `npx vitest run src/lib/__tests__/resend-mapa.test.ts src/app/api`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/resend.ts src/lib/mapa/email-copy.ts src/lib/__tests__/resend-mapa.test.ts
git commit -m "feat(mapa): plan email and newsletter contact sync via Resend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Endpoint `POST /api/mapa/plan`

**Files:**
- Create: `src/app/api/mapa/plan/route.ts`
- Test: `src/app/api/mapa/plan/__tests__/route.test.ts`

**Interfaces:**
- Consumes: `planRequestSchema`, `isHoneypotFilled` (Task 3); `upsertSubscriber` (Task 4); `sendPlanEmail`, `subscribeNewsletterContact` (Task 5).
- Produces: `POST` → `200 { success: true }` | `400 { error }` | `500 { error: 'save_failed' }` | `502 { error: 'email_failed' }`.

- [ ] **Step 1: Tests que fallan**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'

const { upsert, sendPlan, subscribe } = vi.hoisted(() => ({
  upsert: vi.fn(),
  sendPlan: vi.fn(),
  subscribe: vi.fn()
}))

vi.mock('@/lib/mapa/subscribers', () => ({ upsertSubscriber: upsert }))
vi.mock('@/lib/resend', () => ({ sendPlanEmail: sendPlan, subscribeNewsletterContact: subscribe }))

const valid = { email: 'Ana@Example.com', name: 'Ana', locale: 'es', plan: 'PLAN MAPA', newsletter: true, website: '' }
const req = (body: unknown) =>
  new Request('http://localhost/api/mapa/plan', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })

describe('POST /api/mapa/plan', () => {
  beforeEach(() => {
    upsert.mockReset().mockResolvedValue({ unsubscribeToken: 'tok' })
    sendPlan.mockReset().mockResolvedValue(undefined)
    subscribe.mockReset().mockResolvedValue(undefined)
  })

  it('saves, sends the plan and subscribes when newsletter is true', async () => {
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(upsert).toHaveBeenCalledWith({ email: 'ana@example.com', name: 'Ana', locale: 'es', newsletter: true })
    expect(sendPlan).toHaveBeenCalledWith({
      to: 'ana@example.com',
      name: 'Ana',
      locale: 'es',
      plan: 'PLAN MAPA',
      unsubscribeUrl: 'https://www.sergiomonsalve.com/es/newsletter/baja?token=tok'
    })
    expect(subscribe).toHaveBeenCalledWith('ana@example.com', 'Ana')
  })

  it('does not subscribe when newsletter is false', async () => {
    await POST(req({ ...valid, newsletter: false }))
    expect(sendPlan).toHaveBeenCalled()
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('silently accepts bots that fill the honeypot', async () => {
    const res = await POST(req({ ...valid, website: 'http://spam' }))
    expect(res.status).toBe(200)
    expect(upsert).not.toHaveBeenCalled()
    expect(sendPlan).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON and invalid data', async () => {
    expect((await POST(req('{nope'))).status).toBe(400)
    expect((await POST(req({ ...valid, email: 'nope' }))).status).toBe(400)
  })

  it('returns 500 when saving fails and does not send', async () => {
    upsert.mockRejectedValue(new Error('db down'))
    const res = await POST(req(valid))
    expect(res.status).toBe(500)
    expect(sendPlan).not.toHaveBeenCalled()
  })

  it('returns 502 when the plan email fails', async () => {
    sendPlan.mockRejectedValue(new Error('resend down'))
    const res = await POST(req(valid))
    expect(res.status).toBe(502)
    expect(subscribe).not.toHaveBeenCalled()
  })

  it('still succeeds when the newsletter sync fails', async () => {
    subscribe.mockRejectedValue(new Error('segment missing'))
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Correr y ver fallar**

Run: `npx vitest run src/app/api/mapa`
Expected: FAIL (route no existe).

- [ ] **Step 3: Implementar** — `src/app/api/mapa/plan/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { planRequestSchema, isHoneypotFilled } from '@/lib/mapa/schema'
import { upsertSubscriber } from '@/lib/mapa/subscribers'
import { sendPlanEmail, subscribeNewsletterContact } from '@/lib/resend'

const SITE_URL = 'https://www.sergiomonsalve.com'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (isHoneypotFilled(body)) return NextResponse.json({ success: true })

  const parsed = planRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  const { email, name, locale, plan, newsletter } = parsed.data

  let unsubscribeToken: string
  try {
    ;({ unsubscribeToken } = await upsertSubscriber({ email, name, locale, newsletter }))
  } catch (error) {
    console.error('Subscriber upsert error:', error)
    return NextResponse.json({ error: 'save_failed' }, { status: 500 })
  }

  try {
    await sendPlanEmail({
      to: email,
      name,
      locale,
      plan,
      unsubscribeUrl: `${SITE_URL}/${locale}/newsletter/baja?token=${unsubscribeToken}`
    })
  } catch (error) {
    console.error('Plan email error:', error)
    return NextResponse.json({ error: 'email_failed' }, { status: 502 })
  }

  if (newsletter) {
    try {
      await subscribeNewsletterContact(email, name)
    } catch (error) {
      console.error('Newsletter sync error:', error)
    }
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Correr y ver pasar**

Run: `npx vitest run src/app/api/mapa`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/mapa
git commit -m "feat(mapa): POST /api/mapa/plan endpoint

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Página de baja con confirmación

**Files:**
- Create: `src/app/[locale]/(main)/newsletter/baja/page.tsx`, `src/app/[locale]/(main)/newsletter/baja/actions.ts`
- Modify: `src/messages/es.json`, `src/messages/en.json` (namespace `newsletter`)
- Test: `src/app/[locale]/(main)/newsletter/baja/__tests__/actions.test.ts`

**Interfaces:**
- Consumes: `unsubscribeByToken` (Task 4), `unsubscribeNewsletterContact` (Task 5).
- Produces: `confirmUnsubscribe(formData: FormData): Promise<never>` (server action que redirige a `?estado=ok` o `?estado=invalido`).

- [ ] **Step 1: Mensajes** — `es.json`:

```json
"newsletter": {
  "comment": "// newsletter",
  "confirmTitle": "¿Quieres dejar de recibir mis correos?",
  "confirmText": "Al confirmar no te volveré a escribir. Puedes volver a suscribirte cuando quieras desde la plantilla MAPA.",
  "confirmButton": "Sí, darme de baja",
  "doneTitle": "Listo, te diste de baja.",
  "doneText": "No recibirás más correos de la newsletter. Gracias por haber estado.",
  "invalidTitle": "Este enlace no es válido.",
  "invalidText": "Puede que esté incompleto o que ya haya expirado. Escríbeme y lo resuelvo a mano.",
  "contact": "Ir a contacto →"
}
```

`en.json`:

```json
"newsletter": {
  "comment": "// newsletter",
  "confirmTitle": "Do you want to stop receiving my emails?",
  "confirmText": "Once you confirm, I won't write to you again. You can subscribe again anytime from the MAPA template.",
  "confirmButton": "Yes, unsubscribe me",
  "doneTitle": "Done, you're unsubscribed.",
  "doneText": "You won't receive any more newsletter emails. Thanks for being here.",
  "invalidTitle": "This link isn't valid.",
  "invalidText": "It may be incomplete or expired. Write to me and I'll sort it out by hand.",
  "contact": "Go to contact →"
}
```

- [ ] **Step 2: Test que falla** — `__tests__/actions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { unsubscribeByToken, unsubscribeContact, redirect } = vi.hoisted(() => ({
  unsubscribeByToken: vi.fn(),
  unsubscribeContact: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  })
}))

vi.mock('@/lib/mapa/subscribers', () => ({ unsubscribeByToken }))
vi.mock('@/lib/resend', () => ({ unsubscribeNewsletterContact: unsubscribeContact }))
vi.mock('next/navigation', () => ({ redirect }))

import { confirmUnsubscribe } from '../actions'

const form = (fields: Record<string, string>) => {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v))
  return fd
}

describe('confirmUnsubscribe', () => {
  beforeEach(() => {
    unsubscribeByToken.mockReset()
    unsubscribeContact.mockReset().mockResolvedValue(undefined)
  })

  it('unsubscribes and redirects to the done state', async () => {
    unsubscribeByToken.mockResolvedValue({ email: 'ana@example.com' })
    await expect(confirmUnsubscribe(form({ token: 't', locale: 'es' }))).rejects.toThrow('REDIRECT:/es/newsletter/baja?estado=ok')
    expect(unsubscribeContact).toHaveBeenCalledWith('ana@example.com')
  })

  it('redirects to the invalid state when the token is unknown', async () => {
    unsubscribeByToken.mockResolvedValue(null)
    await expect(confirmUnsubscribe(form({ token: 't', locale: 'en' }))).rejects.toThrow('REDIRECT:/en/newsletter/baja?estado=invalido')
    expect(unsubscribeContact).not.toHaveBeenCalled()
  })

  it('still confirms when the Resend sync fails', async () => {
    unsubscribeByToken.mockResolvedValue({ email: 'ana@example.com' })
    unsubscribeContact.mockRejectedValue(new Error('resend down'))
    await expect(confirmUnsubscribe(form({ token: 't', locale: 'es' }))).rejects.toThrow('estado=ok')
  })

  it('falls back to es for an unknown locale', async () => {
    unsubscribeByToken.mockResolvedValue(null)
    await expect(confirmUnsubscribe(form({ token: 't', locale: 'fr' }))).rejects.toThrow('REDIRECT:/es/newsletter/baja?estado=invalido')
  })
})
```

- [ ] **Step 3: Correr y ver fallar**

Run: `npx vitest run "src/app/[locale]/(main)/newsletter"`
Expected: FAIL (módulo no existe).

- [ ] **Step 4: Implementar** — `actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { unsubscribeByToken } from '@/lib/mapa/subscribers'
import { unsubscribeNewsletterContact } from '@/lib/resend'

export async function confirmUnsubscribe(formData: FormData) {
  const token = String(formData.get('token') ?? '')
  const rawLocale = String(formData.get('locale') ?? '')
  const locale = rawLocale === 'en' ? 'en' : 'es'

  const result = await unsubscribeByToken(token)
  if (result) {
    try {
      await unsubscribeNewsletterContact(result.email)
    } catch (error) {
      console.error('Resend unsubscribe error:', error)
    }
  }
  redirect(`/${locale}/newsletter/baja?estado=${result ? 'ok' : 'invalido'}`)
}
```

`page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { confirmUnsubscribe } from './actions'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function NewsletterUnsubscribePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string | string[]; estado?: string | string[] }>
}) {
  const { locale } = await params
  const { token, estado } = await searchParams
  const t = await getTranslations({ locale, namespace: 'newsletter' })
  const tokenValue = typeof token === 'string' ? token : ''

  let title: string
  let text: string
  let showForm = false
  if (estado === 'ok') {
    title = t('doneTitle')
    text = t('doneText')
  } else if (estado === 'invalido' || !tokenValue) {
    title = t('invalidTitle')
    text = t('invalidText')
  } else {
    title = t('confirmTitle')
    text = t('confirmText')
    showForm = true
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-24 space-y-6">
      <p className="font-mono text-xs text-text-muted">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text text-balance">{title}</h1>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
      {showForm ? (
        <form action={confirmUnsubscribe}>
          <input type="hidden" name="token" value={tokenValue} />
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="bg-accent text-background font-mono text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
          >
            {t('confirmButton')}
          </button>
        </form>
      ) : (
        estado !== 'ok' && (
          <Link href="/contact" className="inline-block font-mono text-xs border border-border text-text-secondary px-4 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors">
            {t('contact')}
          </Link>
        )
      )}
    </div>
  )
}
```

- [ ] **Step 5: Correr y ver pasar**

Run: `npx vitest run "src/app/[locale]/(main)/newsletter"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/(main)/newsletter" src/messages/es.json src/messages/en.json
git commit -m "feat(newsletter): unsubscribe page with explicit confirmation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Página `/mapa` y plantilla interactiva

**Files:**
- Create: `src/components/mapa/MapaTool.tsx`, `src/components/mapa/StationTimer.tsx`, `src/components/mapa/CopyButton.tsx`, `src/components/mapa/PlanEmailForm.tsx`, `src/app/[locale]/(main)/mapa/page.tsx`
- Modify: `src/messages/es.json`, `src/messages/en.json` (resto de `mapa`, `meta.mapaTitle`, `meta.mapaDescription`)
- Test: `src/components/mapa/__tests__/MapaTool.test.tsx`, `src/components/mapa/__tests__/PlanEmailForm.test.tsx`

**Interfaces:**
- Consumes: `MapaData`, `PlanCopy`, `buildPlan`, `buildMapPrompt`, `buildTutorPrompt` (Task 3); endpoint de Task 6.
- Produces: `MapaTool({ locale: 'es' | 'en' })`, `PlanEmailForm({ plan: string; locale: 'es' | 'en' })`.

- [ ] **Step 1: Mensajes** — completar `mapa` en `es.json` (además de `days`, `example`, `plan`):

```json
"comment": "// plantilla gratuita · Método MAPA",
"title": "Mapa de habilidad en 20 minutos",
"lede": "Elige algo que quieras aprender en los próximos 30 días. Recorre las cuatro estaciones, de 5 minutos cada una, y al final tendrás un plan concreto.",
"howto": ["1 · Define la meta", "2 · Usa el cronómetro de cada estación", "3 · Copia tu plan o recíbelo por correo"],
"loadExample": "Ver un ejemplo lleno (SQL para el trabajo)",
"clear": "Empezar en blanco",
"hoursOption": "{n} horas",
"hoursOptions": ["2", "3", "5", "8", "10"],
"goal": {
  "title": "Tu meta",
  "hint": "Qué quieres poder hacer, no qué quieres \"estudiar\".",
  "skill": "Habilidad", "skillPh": "Ej.: SQL para analizar ventas",
  "outcome": "Resultado observable en 30 días", "outcomeHint": "Algo que otra persona pueda ver o usar.",
  "outcomePh": "Ej.: armar yo solo el reporte mensual de ventas",
  "why": "Por qué ahora", "whyPh": "Ej.: me toca asumir reportes en enero",
  "hours": "Horas por semana"
},
"stations": {
  "map": { "title": "Mapear", "hint": "Descompón la habilidad en piezas. Luego marca con ★ las 3 que más resultado te dan." },
  "apply": { "title": "Aplicar", "hint": "Aprendes haciendo. Define el proyecto real que vas a construir desde el día 1." },
  "practice": { "title": "Practicar lo difícil", "hint": "Aísla la parte que más te cuesta y practícala sola. Ponte a prueba sin mirar los apuntes." },
  "adjust": { "title": "Ajustar", "hint": "Sin feedback repites errores. Decide quién o qué te corrige y cuándo revisas el plan." }
},
"pieces": { "placeholder": "Pieza de la habilidad", "label": "Pieza {n}", "add": "Agregar pieza", "markKey": "Marcar como clave", "remove": "Quitar pieza", "count": "{n} de 3 clave" },
"fields": {
  "project": "Proyecto real", "projectHint": "Pequeño, útil y terminado en 30 días.", "projectPh": "Ej.: un tablero con las ventas por región del último trimestre",
  "firstStep": "Primer paso de hoy, en menos de 30 minutos", "firstStepPh": "Ej.: instalar DBeaver y conectarme a la base de prueba",
  "weak": "Punto débil probable", "weakPh": "Ej.: entender los JOIN entre varias tablas",
  "drill": "Ejercicio aislado para ese punto", "drillPh": "Ej.: 10 ejercicios cortos de JOIN, 15 minutos al día",
  "recall": "3 preguntas para autoexaminarte cada semana", "recallHint": "Responderlas de memoria fija lo aprendido más que releer.", "recallPh": "Una pregunta por línea",
  "feedback": "Fuente de feedback", "feedbackPh": "Ej.: la analista senior del equipo + la IA como tutor",
  "reviewDay": "Día de revisión semanal"
},
"timer": { "start": "Iniciar", "pause": "Pausar", "resume": "Seguir", "restart": "Reiniciar", "label": "Cronómetro de 5 minutos" },
"prompts": { "mapTitle": "Pídele ayuda a la IA", "tutorTitle": "La IA como tutor", "copy": "Copiar prompt", "copied": "Copiado" },
"result": { "label": "// resultado", "title": "Tu plan de 30 días", "hint": "Se arma solo con lo que escribiste.", "copy": "Copiar mi plan", "copied": "Copiado" },
"email": {
  "title": "Recibe tu plan por correo",
  "hint": "Te lo envío para que no se pierda.",
  "email": "Correo", "emailPh": "tu@correo.com",
  "name": "Nombre (opcional)",
  "newsletter": "Quiero recibir la guía semanal de aprendizaje con IA. Puedo darme de baja cuando quiera.",
  "privacy": "Cómo trato tus datos",
  "submit": "Enviarme el plan", "sending": "Enviando…",
  "success": "Listo. Revisa tu correo en un minuto (y la carpeta de spam).",
  "error": "No pude enviar el plan. Intenta de nuevo en un momento."
},
"author": "Plantilla del Método MAPA de Sergio Monsalve, profesor de la Universidad EAFIT desde hace 15 años e ingeniero de IA.",
"cta": "Aplicarlo con tu equipo o en una cohorte →",
"storage": "Lo que escribes se guarda solo en este navegador."
```

`en.json` (mismas claves):

```json
"comment": "// free template · MAPA Method",
"title": "Skill map in 20 minutes",
"lede": "Pick something you want to learn in the next 30 days. Go through the four stations, 5 minutes each, and you'll end with a concrete plan.",
"howto": ["1 · Set the goal", "2 · Use each station's timer", "3 · Copy your plan or get it by email"],
"loadExample": "See a filled-in example (SQL for work)",
"clear": "Start blank",
"hoursOption": "{n} hours",
"hoursOptions": ["2", "3", "5", "8", "10"],
"goal": {
  "title": "Your goal",
  "hint": "What you want to be able to do, not what you want to \"study\".",
  "skill": "Skill", "skillPh": "E.g. SQL for sales analysis",
  "outcome": "Observable result in 30 days", "outcomeHint": "Something another person can see or use.",
  "outcomePh": "E.g. build the monthly sales report on my own",
  "why": "Why now", "whyPh": "E.g. I take over reports in January",
  "hours": "Hours per week"
},
"stations": {
  "map": { "title": "Map", "hint": "Break the skill into pieces. Then star the 3 that give you the most results." },
  "apply": { "title": "Apply", "hint": "You learn by doing. Define the real project you'll build from day one." },
  "practice": { "title": "Practice the hard parts", "hint": "Isolate what's hardest and practice it alone. Test yourself without your notes." },
  "adjust": { "title": "Adjust", "hint": "Without feedback you repeat mistakes. Decide who or what corrects you and when you review the plan." }
},
"pieces": { "placeholder": "Piece of the skill", "label": "Piece {n}", "add": "Add piece", "markKey": "Mark as key", "remove": "Remove piece", "count": "{n} of 3 key" },
"fields": {
  "project": "Real project", "projectHint": "Small, useful and finished in 30 days.", "projectPh": "E.g. a dashboard with last quarter's sales by region",
  "firstStep": "Today's first step, under 30 minutes", "firstStepPh": "E.g. install DBeaver and connect to the test database",
  "weak": "Likely weak spot", "weakPh": "E.g. understanding JOINs across several tables",
  "drill": "Isolated drill for that spot", "drillPh": "E.g. 10 short JOIN exercises, 15 minutes a day",
  "recall": "3 questions to test yourself every week", "recallHint": "Answering from memory makes learning stick better than rereading.", "recallPh": "One question per line",
  "feedback": "Feedback source", "feedbackPh": "E.g. the team's senior analyst + AI as a tutor",
  "reviewDay": "Weekly review day"
},
"timer": { "start": "Start", "pause": "Pause", "resume": "Resume", "restart": "Restart", "label": "5-minute timer" },
"prompts": { "mapTitle": "Ask AI for help", "tutorTitle": "AI as a tutor", "copy": "Copy prompt", "copied": "Copied" },
"result": { "label": "// result", "title": "Your 30-day plan", "hint": "It builds itself from what you wrote.", "copy": "Copy my plan", "copied": "Copied" },
"email": {
  "title": "Get your plan by email",
  "hint": "I'll send it so it doesn't get lost.",
  "email": "Email", "emailPh": "you@email.com",
  "name": "Name (optional)",
  "newsletter": "I want the weekly guide on learning with AI. I can unsubscribe anytime.",
  "privacy": "How I handle your data",
  "submit": "Send me the plan", "sending": "Sending…",
  "success": "Done. Check your inbox in a minute (and your spam folder).",
  "error": "I couldn't send the plan. Please try again in a moment."
},
"author": "MAPA Method template by Sergio Monsalve, professor at Universidad EAFIT for 15 years and AI engineer.",
"cta": "Apply it with your team or in a cohort →",
"storage": "What you write is saved only in this browser."
```

En `meta`: `"mapaTitle": "Mapa de habilidad"`, `"mapaDescription": "Plantilla gratuita del Método MAPA: convierte cualquier habilidad en un plan de 30 días en 20 minutos."` (es) y `"mapaTitle": "Skill map"`, `"mapaDescription": "Free MAPA Method template: turn any skill into a 30-day plan in 20 minutes."` (en).

- [ ] **Step 2: Tests que fallan** — `src/components/mapa/__tests__/MapaTool.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import es from '@/messages/es.json'
import MapaTool from '../MapaTool'

function lookup(path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], es.mapa)
}

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, vars?: Record<string, string | number>) => {
      const value = String(lookup(key) ?? key)
      return vars ? value.replace(/\{(\w+)\}/g, (_, n) => String(vars[n] ?? `{${n}}`)) : value
    }
    t.raw = (key: string) => lookup(key)
    return t
  }
}))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}))

describe('MapaTool', () => {
  beforeEach(() => localStorage.clear())

  it('renders the four MAPA stations in order', () => {
    render(<MapaTool locale="es" />)
    const titles = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    expect(titles).toEqual(expect.arrayContaining(['Mapear', 'Aplicar', 'Practicar lo difícil', 'Ajustar']))
  })

  it('updates the plan as the person types', async () => {
    const user = userEvent.setup()
    render(<MapaTool locale="es" />)
    await user.type(screen.getByLabelText('Habilidad'), 'Excel')
    expect(screen.getByTestId('plan').textContent).toContain('Habilidad: Excel')
  })

  it('loads the example and counts key pieces', async () => {
    const user = userEvent.setup()
    render(<MapaTool locale="es" />)
    await user.click(screen.getByRole('button', { name: 'Ver un ejemplo lleno (SQL para el trabajo)' }))
    expect(screen.getByText('3 de 3 clave')).toBeInTheDocument()
    expect(screen.getByTestId('plan').textContent).toContain('★ JOIN entre tablas')
  })

  it('restores a saved draft from localStorage', () => {
    localStorage.setItem('mapa-habilidad-v1', JSON.stringify({ ...es.mapa.example, skill: 'Guardado' }))
    render(<MapaTool locale="es" />)
    expect(screen.getByLabelText('Habilidad')).toHaveValue('Guardado')
  })

  it('ignores a corrupted draft', () => {
    localStorage.setItem('mapa-habilidad-v1', '{not json')
    render(<MapaTool locale="es" />)
    expect(screen.getByLabelText('Habilidad')).toHaveValue('')
  })
})
```

`src/components/mapa/__tests__/PlanEmailForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PlanEmailForm from '../PlanEmailForm'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}))

global.fetch = vi.fn()

describe('PlanEmailForm', () => {
  beforeEach(() => vi.mocked(fetch).mockReset())

  it('starts with the newsletter box unchecked', () => {
    render(<PlanEmailForm plan="PLAN" locale="es" />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('posts the plan without newsletter by default and shows success', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }))
    const user = userEvent.setup()
    render(<PlanEmailForm plan="PLAN" locale="es" />)
    await user.type(screen.getByLabelText('email.email'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'email.submit' }))
    await waitFor(() => expect(screen.getByText('email.success')).toBeInTheDocument())
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body).toEqual({ email: 'ana@example.com', name: '', locale: 'es', plan: 'PLAN', newsletter: false, website: '' })
  })

  it('sends newsletter: true when the box is checked', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }))
    const user = userEvent.setup()
    render(<PlanEmailForm plan="PLAN" locale="es" />)
    await user.type(screen.getByLabelText('email.email'), 'ana@example.com')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'email.submit' }))
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).newsletter).toBe(true)
  })

  it('shows an error and keeps the form when the API fails', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 502 }))
    const user = userEvent.setup()
    render(<PlanEmailForm plan="PLAN" locale="es" />)
    await user.type(screen.getByLabelText('email.email'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'email.submit' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('email.error'))
    expect(screen.getByLabelText('email.email')).toHaveValue('ana@example.com')
  })
})
```

- [ ] **Step 3: Correr y ver fallar**

Run: `npx vitest run src/components/mapa`
Expected: FAIL (componentes no existen).

- [ ] **Step 4: Implementar** — `src/components/mapa/CopyButton.tsx`:

```tsx
'use client'

import { useState } from 'react'

export default function CopyButton({ text, label, copiedLabel, className }: {
  text: string
  label: string
  copiedLabel: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {copied ? copiedLabel : label}
    </button>
  )
}
```

`src/components/mapa/StationTimer.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const DURATION = 300

export default function StationTimer() {
  const t = useTranslations('mapa')
  const [left, setLeft] = useState(DURATION)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) {
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  function handleClick() {
    if (running) return setRunning(false)
    if (left === 0) setLeft(DURATION)
    setRunning(true)
  }

  const label = running ? t('timer.pause') : left === 0 ? t('timer.restart') : left < DURATION ? t('timer.resume') : t('timer.start')
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-2" aria-label={t('timer.label')}>
      <span className={`font-mono text-sm tabular-nums ${left === 0 ? 'text-accent' : 'text-text-secondary'}`}>{mm}:{ss}</span>
      <button type="button" onClick={handleClick} className="font-mono text-xs border border-border px-3 py-1.5 rounded-sm text-text-secondary hover:border-accent hover:text-accent transition-colors">
        {label}
      </button>
    </div>
  )
}
```

`src/components/mapa/PlanEmailForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function PlanEmailForm({ plan, locale }: { plan: string; locale: 'es' | 'en' }) {
  const t = useTranslations('mapa')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/mapa/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, locale, plan, newsletter, website })
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return <p className="font-mono text-sm text-accent" role="status">{t('email.success')}</p>
  }

  const inputClass = 'w-full bg-surface border border-border focus:border-border-active outline-none text-text text-sm px-3 py-2.5 rounded-sm font-mono placeholder:text-text-muted transition-colors'
  const labelClass = 'block font-mono text-xs text-text-muted mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-text">{t('email.title')}</h3>
        <p className="text-xs text-text-secondary">{t('email.hint')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="plan-email" className={labelClass}>{t('email.email')}</label>
          <input id="plan-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t('email.emailPh')} className={inputClass} />
        </div>
        <div>
          <label htmlFor="plan-name" className={labelClass}>{t('email.name')}</label>
          <input id="plan-name" type="text" maxLength={80} value={name} onChange={e => setName(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="plan-website">website</label>
        <input id="plan-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>
      <label htmlFor="plan-newsletter" className="flex items-start gap-3 text-xs text-text-secondary leading-relaxed cursor-pointer">
        <input id="plan-newsletter" type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)} className="mt-0.5 accent-[var(--color-accent)]" />
        <span>
          {t('email.newsletter')}{' '}
          <Link href="/privacidad" className="underline hover:text-accent">{t('email.privacy')}</Link>
        </span>
      </label>
      {status === 'error' && <p role="alert" className="font-mono text-xs text-red-400">{t('email.error')}</p>}
      <button type="submit" disabled={status === 'loading'} aria-busy={status === 'loading'} className="bg-accent text-background font-mono text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40">
        {status === 'loading' ? t('email.sending') : t('email.submit')}
      </button>
    </form>
  )
}
```

`src/components/mapa/MapaTool.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buildMapPrompt, buildPlan, buildTutorPrompt, type MapaData, type MapaPiece, type PlanCopy } from '@/lib/mapa/plan'
import StationTimer from './StationTimer'
import CopyButton from './CopyButton'
import PlanEmailForm from './PlanEmailForm'

const STORAGE_KEY = 'mapa-habilidad-v1'
const TEXT_FIELDS = ['skill', 'outcome', 'why', 'hours', 'project', 'firstStep', 'weak', 'drill', 'recall', 'feedback', 'reviewDay'] as const

function emptyData(reviewDay: string): MapaData {
  return {
    skill: '', outcome: '', why: '', hours: '3', project: '', firstStep: '', weak: '', drill: '',
    recall: '', feedback: '', reviewDay,
    pieces: Array.from({ length: 5 }, () => ({ text: '', key: false }))
  }
}

function isMapaData(value: unknown): value is MapaData {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return TEXT_FIELDS.every(f => typeof v[f] === 'string') && Array.isArray(v.pieces)
}

const inputClass = 'w-full bg-surface border border-border focus:border-border-active outline-none text-text text-sm px-3 py-2.5 rounded-sm placeholder:text-text-muted transition-colors'
const labelClass = 'flex flex-col gap-1.5 text-sm font-medium text-text'
const hintClass = 'text-xs font-normal text-text-muted'
const smallButton = 'font-mono text-xs border border-border px-3 py-1.5 rounded-sm text-text-secondary hover:border-accent hover:text-accent transition-colors'

export default function MapaTool({ locale }: { locale: 'es' | 'en' }) {
  const t = useTranslations('mapa')
  const days = t.raw('days') as string[]
  const hoursOptions = t.raw('hoursOptions') as string[]
  const howto = t.raw('howto') as string[]
  const copy = t.raw('plan') as PlanCopy
  const example = t.raw('example') as MapaData
  const [data, setData] = useState<MapaData>(() => emptyData(days[4]))

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
      // Restore after mount to keep server and client HTML identical on hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isMapaData(saved)) setData(saved)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [data])

  const set = (field: (typeof TEXT_FIELDS)[number]) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData(d => ({ ...d, [field]: e.target.value }))
  const setPieces = (fn: (pieces: MapaPiece[]) => MapaPiece[]) => setData(d => ({ ...d, pieces: fn(d.pieces) }))

  const plan = buildPlan(data, copy)
  const keyCount = data.pieces.filter(p => p.key && p.text.trim()).length

  function field(id: (typeof TEXT_FIELDS)[number], label: string, placeholder: string, hint?: string, multiline = false) {
    return (
      <label htmlFor={`mapa-${id}`} className={labelClass}>
        {label}
        {hint && <span className={hintClass}>{hint}</span>}
        {multiline ? (
          <textarea id={`mapa-${id}`} rows={3} value={data[id]} onChange={set(id)} placeholder={placeholder} className={`${inputClass} resize-y`} />
        ) : (
          <input id={`mapa-${id}`} type="text" value={data[id]} onChange={set(id)} placeholder={placeholder} className={inputClass} />
        )}
      </label>
    )
  }

  function station(letter: string, key: 'map' | 'apply' | 'practice' | 'adjust', children: React.ReactNode) {
    return (
      <section className="border border-border rounded-sm p-5 sm:p-7 space-y-5 bg-background">
        <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-4 items-center">
          <span aria-hidden="true" className="font-mono text-4xl font-bold text-accent w-10 text-center">{letter}</span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-text">{t(`stations.${key}.title`)}</h2>
            <p className="text-xs text-text-secondary">{t(`stations.${key}.hint`)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1"><StationTimer /></div>
        </div>
        {children}
      </section>
    )
  }

  function prompt(title: string, text: string) {
    return (
      <div className="bg-surface rounded-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text">{title}</p>
          <CopyButton text={text} label={t('prompts.copy')} copiedLabel={t('prompts.copied')} className={smallButton} />
        </div>
        <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">{text}</pre>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
      <header className="space-y-4">
        <p className="font-mono text-xs text-accent">{t('comment')}</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text text-balance">{t('title')}</h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl">{t('lede')}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-text-muted">
          {howto.map(step => <li key={step}>{step}</li>)}
        </ul>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setData(example)} className={`${smallButton} border-dashed`}>{t('loadExample')}</button>
          <button type="button" onClick={() => setData(emptyData(days[4]))} className={`${smallButton} border-dashed`}>{t('clear')}</button>
        </div>
      </header>

      <section className="border border-border rounded-sm p-5 sm:p-7 space-y-5 bg-background">
        <div>
          <h2 className="text-xl font-bold text-text">{t('goal.title')}</h2>
          <p className="text-xs text-text-secondary">{t('goal.hint')}</p>
        </div>
        {field('skill', t('goal.skill'), t('goal.skillPh'))}
        {field('outcome', t('goal.outcome'), t('goal.outcomePh'), t('goal.outcomeHint'))}
        <div className="grid gap-5 sm:grid-cols-2">
          {field('why', t('goal.why'), t('goal.whyPh'))}
          <label htmlFor="mapa-hours" className={labelClass}>
            {t('goal.hours')}
            <select id="mapa-hours" value={data.hours} onChange={set('hours')} className={inputClass}>
              {hoursOptions.map(n => <option key={n} value={n}>{t('hoursOption', { n })}</option>)}
            </select>
          </label>
        </div>
      </section>

      {station('M', 'map', (
        <>
          <div className="space-y-2">
            {data.pieces.map((piece, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                <button
                  type="button"
                  aria-pressed={piece.key}
                  aria-label={t('pieces.markKey')}
                  onClick={() => setPieces(ps => ps.map((p, j) => (j === i ? { ...p, key: !p.key } : p)))}
                  className={`w-9 h-9 rounded-sm border text-base ${piece.key ? 'bg-accent border-accent text-background' : 'border-border text-text-muted hover:border-accent'}`}
                >★</button>
                <input
                  type="text"
                  aria-label={t('pieces.label', { n: String(i + 1) })}
                  value={piece.text}
                  onChange={e => setPieces(ps => ps.map((p, j) => (j === i ? { ...p, text: e.target.value } : p)))}
                  placeholder={t('pieces.placeholder')}
                  className={inputClass}
                />
                <button type="button" aria-label={t('pieces.remove')} onClick={() => setPieces(ps => ps.filter((_, j) => j !== i))} className="w-9 h-9 rounded-sm border border-border text-text-muted hover:border-accent">×</button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setPieces(ps => [...ps, { text: '', key: false }])} className={smallButton}>{t('pieces.add')}</button>
            <span className="font-mono text-xs text-text-muted">{t('pieces.count', { n: String(keyCount) })}</span>
          </div>
          {prompt(t('prompts.mapTitle'), buildMapPrompt(data, copy))}
        </>
      ))}

      {station('A', 'apply', (
        <>
          {field('project', t('fields.project'), t('fields.projectPh'), t('fields.projectHint'), true)}
          {field('firstStep', t('fields.firstStep'), t('fields.firstStepPh'))}
        </>
      ))}

      {station('P', 'practice', (
        <>
          {field('weak', t('fields.weak'), t('fields.weakPh'))}
          {field('drill', t('fields.drill'), t('fields.drillPh'))}
          {field('recall', t('fields.recall'), t('fields.recallPh'), t('fields.recallHint'), true)}
        </>
      ))}

      {station('A', 'adjust', (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {field('feedback', t('fields.feedback'), t('fields.feedbackPh'))}
            <label htmlFor="mapa-reviewDay" className={labelClass}>
              {t('fields.reviewDay')}
              <select id="mapa-reviewDay" value={data.reviewDay} onChange={set('reviewDay')} className={inputClass}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          </div>
          {prompt(t('prompts.tutorTitle'), buildTutorPrompt(data, copy))}
        </>
      ))}

      <section className="border-2 border-accent rounded-sm p-5 sm:p-7 space-y-5">
        <div>
          <p className="font-mono text-xs text-accent">{t('result.label')}</p>
          <h2 className="text-xl font-bold text-text">{t('result.title')}</h2>
          <p className="text-xs text-text-secondary">{t('result.hint')}</p>
        </div>
        <pre data-testid="plan" className="font-mono text-xs sm:text-sm text-text whitespace-pre-wrap leading-relaxed bg-surface border border-border rounded-sm p-4">{plan}</pre>
        <CopyButton text={plan} label={t('result.copy')} copiedLabel={t('result.copied')} className="bg-accent text-background font-mono text-xs font-bold px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity" />
        <div className="border-t border-border pt-5">
          <PlanEmailForm plan={plan} locale={locale} />
        </div>
      </section>

      <footer className="space-y-2 text-xs text-text-secondary">
        <p>{t('author')}</p>
        <Link href="/formacion" className="text-accent hover:underline">{t('cta')}</Link>
        <p className="font-mono text-text-muted">{t('storage')}</p>
      </footer>
    </div>
  )
}
```

`src/app/[locale]/(main)/mapa/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import MapaTool from '@/components/mapa/MapaTool'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('mapaTitle'),
    description: t('mapaDescription'),
    alternates: { canonical: `/${locale}/mapa`, languages: { es: '/es/mapa', en: '/en/mapa' } },
    openGraph: { title: `${t('mapaTitle')} — Sergio Monsalve`, description: t('mapaDescription'), url: `/${locale}/mapa` }
  }
}

export default async function MapaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <MapaTool locale={locale === 'en' ? 'en' : 'es'} />
}
```

- [ ] **Step 5: Correr y ver pasar**

Run: `npx vitest run src/components/mapa`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/mapa "src/app/[locale]/(main)/mapa" src/messages/es.json src/messages/en.json
git commit -m "feat(mapa): interactive MAPA template page with plan by email

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Privacidad, enlaces y sitemap

**Files:**
- Create: `src/app/[locale]/(main)/privacidad/page.tsx`
- Modify: `src/components/FormacionContent.tsx`, `src/components/__tests__/FormacionContent.test.tsx`, `src/components/about/content.ts`, `src/components/about/AboutPageContent.tsx`, `src/app/sitemap.ts`, `src/components/Footer.tsx`, `src/messages/es.json`, `src/messages/en.json`

**Interfaces:**
- Consumes: rutas `/mapa` (Task 8) y `/contact?tipo=training` (Task 2).

- [ ] **Step 1: Test que falla** — en `FormacionContent.test.tsx` cambiar la expectativa del CTA y agregar el enlace a la plantilla:

```ts
  it('links the main CTA to the contact page with the training type and offers WhatsApp', () => {
    render(<FormacionContent />)
    expect(screen.getByRole('link', { name: 'cta.contact' })).toHaveAttribute('href', '/contact?tipo=training')
    expect(screen.getByRole('link', { name: 'cta.whatsapp' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/573508025988\?text=/)
  })

  it('links to the free MAPA template', () => {
    render(<FormacionContent />)
    expect(screen.getByRole('link', { name: 'method.tryTemplate' })).toHaveAttribute('href', '/mapa')
  })
```

(reemplaza el test anterior "links the main CTA to the contact page and offers WhatsApp").

- [ ] **Step 2: Correr y ver fallar**

Run: `npx vitest run src/components/__tests__/FormacionContent.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

En `FormacionContent.tsx`: el `Link` del CTA usa `href="/contact?tipo=training"`; después del `<ol>` de pasos agregar:

```tsx
        <Link href="/mapa" className="inline-block font-mono text-xs border border-accent text-accent px-4 py-2.5 rounded-sm hover:bg-accent hover:text-background transition-colors">
          {t('method.tryTemplate')}
        </Link>
```

Mensajes `formacion.method.tryTemplate`: `"Prueba el Método MAPA gratis →"` (es), `"Try the MAPA Method for free →"` (en).

En `about/content.ts` agregar `ctaMapa: 'Plantilla MAPA gratis →'` (es, junto a `ctaFormacion`) y `ctaMapa: 'Free MAPA template →'` (en); en `AboutPageContent.tsx`, dentro del bloque CTA, después del `Link` a `/formacion`:

```tsx
                <Link
                  href="/mapa"
                  className="font-mono text-xs border border-border text-text-secondary px-4 py-2.5 rounded-sm hover:border-accent hover:text-accent transition-colors"
                >
                  {c.ctaMapa}
                </Link>
```

En `sitemap.ts`: `const staticRoutes = ['', '/about', '/formacion', '/mapa', '/privacidad', '/contact', '/blog', '/recipes', '/biblioteca']`.

Mensajes `privacy` (es):

```json
"privacy": {
  "comment": "// tratamiento de datos",
  "title": "Cómo trato tus datos",
  "updated": "Última actualización: 15 de octubre de 2026",
  "sections": [
    { "title": "Responsable", "text": "Sergio Monsalve, Guarne (Antioquia, Colombia). Contacto: formulario de https://www.sergiomonsalve.com/es/contact o WhatsApp +57 350 802 5988." },
    { "title": "Qué datos recojo", "text": "Tu correo, tu nombre si lo das, el idioma del sitio y, si lo pides, el plan que armaste en la plantilla MAPA. En el formulario de contacto, además, tu mensaje." },
    { "title": "Para qué los uso", "text": "Para enviarte el plan que pediste y responder tus mensajes. Solo si marcas la casilla, para enviarte la newsletter. No vendo ni cedo tus datos." },
    { "title": "Con quién los comparto", "text": "Con los proveedores que hacen funcionar el sitio: Supabase (base de datos), Resend (envío de correos) y Vercel (alojamiento). Pueden almacenar datos fuera de Colombia." },
    { "title": "Tus derechos", "text": "Puedes conocer, actualizar, rectificar y pedir la supresión de tus datos, o revocar tu autorización, conforme a la Ley 1581 de 2012. Escríbeme por el formulario de contacto y respondo en un máximo de 15 días hábiles. Cada correo de la newsletter trae un enlace para darte de baja." },
    { "title": "Cuánto tiempo los guardo", "text": "Mientras sigas suscrito o hasta que pidas borrarlos." }
  ]
}
```

(en):

```json
"privacy": {
  "comment": "// data policy",
  "title": "How I handle your data",
  "updated": "Last updated: October 15, 2026",
  "sections": [
    { "title": "Controller", "text": "Sergio Monsalve, Guarne (Antioquia, Colombia). Contact: the form at https://www.sergiomonsalve.com/en/contact or WhatsApp +57 350 802 5988." },
    { "title": "What I collect", "text": "Your email, your name if you give it, the site language and, if you ask for it, the plan you built in the MAPA template. In the contact form, also your message." },
    { "title": "What I use it for", "text": "To send you the plan you requested and reply to your messages. Only if you tick the box, to send you the newsletter. I don't sell or share your data." },
    { "title": "Who I share it with", "text": "With the providers that run the site: Supabase (database), Resend (email delivery) and Vercel (hosting). They may store data outside Colombia." },
    { "title": "Your rights", "text": "You can access, update, correct and request deletion of your data, or withdraw consent, under Colombia's Law 1581 of 2012 and, where it applies, the GDPR. Write to me through the contact form and I'll reply within 15 business days. Every newsletter email includes an unsubscribe link." },
    { "title": "How long I keep it", "text": "While you remain subscribed or until you ask me to delete it." }
  ]
}
```

En `meta`: `"privacyTitle": "Tratamiento de datos"` / `"Data policy"`.

`src/app/[locale]/(main)/privacidad/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { title: t('privacyTitle'), alternates: { canonical: `/${locale}/privacidad` } }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })
  const sections = t.raw('sections') as { title: string; text: string }[]
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs text-text-muted">{t('comment')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-text">{t('title')}</h1>
        <p className="font-mono text-xs text-text-muted">{t('updated')}</p>
      </header>
      {sections.map(s => (
        <section key={s.title} className="space-y-2">
          <h2 className="text-base font-bold text-text">{s.title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{s.text}</p>
        </section>
      ))}
    </div>
  )
}
```

Footer (`src/components/Footer.tsx`, hoy sin traducciones): convertirlo en server component con traducción y agregar el enlace como primer elemento del `div` de enlaces:

```tsx
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function Footer() {
  const t = await getTranslations('footer')
  return (
    // ... mismo JSX, con este hijo nuevo al inicio de <div className="flex items-center gap-6">:
          <Link href="/privacidad" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">
            {t('privacy')}
          </Link>
  )
}
```

Mensajes: nuevo namespace `"footer": { "privacy": "Privacidad" }` (es) y `"footer": { "privacy": "Privacy" }` (en). `Footer` ya se renderiza dentro de `src/app/[locale]/layout.tsx`, donde `getTranslations` tiene el locale disponible (igual que `Nav`, que es async).

- [ ] **Step 4: Correr y ver pasar**

Run: `npm run test:run`
Expected: PASS (suite completa)

- [ ] **Step 5: Commit**

```bash
git add -A src
git commit -m "feat(site): privacy page and links to the MAPA template

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Verificación y puesta en producción

**Files:** ninguno nuevo (`formacion-mapa/03-guion-video-pilar.md` fuera del repo).

- [ ] **Step 1: Verificación local**

Run: `npm run test:run && npx eslint src/lib/mapa src/components/mapa src/app/api/mapa "src/app/[locale]/(main)/mapa" "src/app/[locale]/(main)/newsletter" "src/app/[locale]/(main)/privacidad" && npm run build`
Expected: tests PASS, eslint sin errores en archivos nuevos, build OK con rutas `/[locale]/mapa`, `/[locale]/newsletter/baja`, `/[locale]/privacidad`, `/api/mapa/plan`.

- [ ] **Step 2: Revisión visual** — `npx next dev -p 3107`, abrir `/es/mapa`: cargar ejemplo, verificar plan, cronómetro, copiar; `/en/mapa`; `/es/newsletter/baja` (sin token → inválido); `/es/privacidad`; `/es/contact?tipo=training` (preseleccionado). Captura de `/es/mapa`.

- [ ] **Step 3: Rebase sobre `origin/main`** — `git fetch origin && git rebase origin/main`; resolver conflictos en `es.json`/`en.json` si la otra sesión los tocó; repetir Step 1.

- [ ] **Step 4: Producción (pedir permiso a Sergio antes de cada acción externa)**
  1. Aplicar `006_subscribers.sql` y `007_contact_training.sql` en Supabase producción (SQL Editor del proyecto `orlniujfwolyinsuezcu` o Supabase MCP).
  2. Crear el Segment "Newsletter" en Resend y guardar su id como `RESEND_SEGMENT_ID` en Vercel (production y preview).
  3. `git push` de la rama y fast-forward de `main` (si `main` avanzó, rebase primero).
  4. Esperar el despliegue y probar con un correo propio: plan recibido, suscripción registrada en Supabase y en el Segment, baja con confirmación.

- [ ] **Step 5: Guion del video 01** — en `formacion-mapa/03-guion-video-pilar.md` reemplazar "al descargarla quedas inscrito en mi newsletter" por "si quieres, la plantilla te envía tu plan por correo y puedes suscribirte a la guía semanal", y el enlace de la descripción por `https://www.sergiomonsalve.com/es/mapa`.
