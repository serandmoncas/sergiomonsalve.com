# Experiencias IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Experiencias IA" section — a public bitácora for the AI study group, with its own distinct visual identity, isolated from the main site's Nav/Footer via a Next.js route group.

**Architecture:** A route group `(main)` absorbs all existing `/[locale]/*` routes unchanged (so they keep their current Nav/Footer chrome), freeing `/[locale]/experiencias-ia` to be a sibling subtree with its own layout, fonts, and scoped CSS ("cuaderno del ingeniero": papel/tinta/cuero). Content is a single typed data module (`src/lib/experiencias-ia/data.ts`) transcribed from the group's real session notes, with derived functions for metrics and the open-pendientes panel so nothing is hand-duplicated.

**Tech Stack:** Next.js 16 App Router, TypeScript, next/font/google (Bricolage Grotesque, Newsreader; JetBrains Mono reused from the existing global font), Vitest + React Testing Library.

## Global Constraints

- **No inventar contenido**: todo nombre, fecha, cita, referencia o URL debe rastrearse a `docs/superpowers/specs/anexos/experiencias-ia/data.js`. Si una referencia tiene `url: ""`, se renderiza como texto plano, nunca un link fabricado.
- Todo en español (sin i18n para esta sección) — vive bajo `/[locale]/experiencias-ia` pero el contenido es idéntico en `/es/` y `/en/`.
- Usable a 360px de ancho sin scroll horizontal.
- `prefers-reduced-motion: reduce` desactiva animaciones/transiciones dentro de `.experiencias-ia`.
- Foco de teclado visible (outline color cuero `#8a4b2a`) en todo elemento interactivo de la sección.
- El resto del sitio (`(main)/...`) debe seguir funcionando exactamente igual después del route-group refactor — mismas URLs, mismo comportamiento, sin regresiones.
- Paleta: tinta `#141b1f`, tinta-2 `#3d4a52`, papel `#e9e5db`, papel-2 `#dfd9cc`, cuero `#8a4b2a`, latón `#b08d3f`, verde silla `#3f6b4e`.

---

### Task 1: Route group refactor — aislar el chrome del sitio principal

**Files:**
- Move: `src/app/[locale]/about/` → `src/app/[locale]/(main)/about/`
- Move: `src/app/[locale]/admin/` → `src/app/[locale]/(main)/admin/`
- Move: `src/app/[locale]/biblioteca/` → `src/app/[locale]/(main)/biblioteca/`
- Move: `src/app/[locale]/blog/` → `src/app/[locale]/(main)/blog/`
- Move: `src/app/[locale]/contact/` → `src/app/[locale]/(main)/contact/`
- Move: `src/app/[locale]/cursos/` → `src/app/[locale]/(main)/cursos/`
- Move: `src/app/[locale]/guestbook/` → `src/app/[locale]/(main)/guestbook/`
- Move: `src/app/[locale]/portfolio/` → `src/app/[locale]/(main)/portfolio/`
- Move: `src/app/[locale]/recipes/` → `src/app/[locale]/(main)/recipes/`
- Move: `src/app/[locale]/page.tsx` → `src/app/[locale]/(main)/page.tsx`
- Move: `src/app/[locale]/opengraph-image.tsx` → `src/app/[locale]/(main)/opengraph-image.tsx`
- Create: `src/app/[locale]/(main)/layout.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Keep as-is (do NOT move): `src/app/[locale]/icon.tsx` (site-wide favicon, must stay visible on every route including `experiencias-ia`)

**Interfaces:**
- Produces: `(main)/layout.tsx` renders `<Nav/>` + `<main className="pt-16 flex-1">{children}</main>` + `<Footer/>`, wrapped in `<SiteThemeWrapper>`. Every task after this one that adds a page under `experiencias-ia/` relies on the root `[locale]/layout.tsx` **not** rendering Nav/Footer/SiteThemeWrapper itself.

- [ ] **Step 1: Move existing route folders and files into `(main)/`**

```bash
mkdir -p "src/app/[locale]/(main)"
git mv "src/app/[locale]/about" "src/app/[locale]/(main)/about"
git mv "src/app/[locale]/admin" "src/app/[locale]/(main)/admin"
git mv "src/app/[locale]/biblioteca" "src/app/[locale]/(main)/biblioteca"
git mv "src/app/[locale]/blog" "src/app/[locale]/(main)/blog"
git mv "src/app/[locale]/contact" "src/app/[locale]/(main)/contact"
git mv "src/app/[locale]/cursos" "src/app/[locale]/(main)/cursos"
git mv "src/app/[locale]/guestbook" "src/app/[locale]/(main)/guestbook"
git mv "src/app/[locale]/portfolio" "src/app/[locale]/(main)/portfolio"
git mv "src/app/[locale]/recipes" "src/app/[locale]/(main)/recipes"
git mv "src/app/[locale]/page.tsx" "src/app/[locale]/(main)/page.tsx"
git mv "src/app/[locale]/opengraph-image.tsx" "src/app/[locale]/(main)/opengraph-image.tsx"
```

None of these files use relative imports that climb directories (verified: all use the `@/` alias), so moving them one level deeper does not break any import.

- [ ] **Step 2: Create `src/app/[locale]/(main)/layout.tsx`**

```tsx
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SiteThemeWrapper from '@/components/SiteThemeWrapper'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteThemeWrapper>
      <Nav />
      <main className="pt-16 flex-1">{children}</main>
      <Footer />
    </SiteThemeWrapper>
  )
}
```

This is exactly the Nav/main/Footer/SiteThemeWrapper block that used to live in `[locale]/layout.tsx`.

- [ ] **Step 3: Slim down `src/app/[locale]/layout.tsx`**

Replace its full contents with:

```tsx
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { routing } from '@/i18n/routing'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://sergiomonsalve.com'),
  title: {
    default: 'Sergio Monsalve — AI Software Engineer',
    template: '%s — Sergio Monsalve'
  },
  openGraph: {
    siteName: 'Sergio Monsalve',
    type: 'website'
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

The only functional change from the previous version: `<Nav/>`, `<main>`, `<Footer/>`, and `<SiteThemeWrapper>` moved to `(main)/layout.tsx` (Step 2).

- [ ] **Step 4: Verify the full site still builds and existing tests pass**

```bash
npm run build
npm run test:run
```

Expected: build succeeds, route list still includes `/[locale]`, `/[locale]/blog`, `/[locale]/admin`, etc. (now resolved through the `(main)` group — the group does not appear in the URL), and all existing tests pass unchanged.

- [ ] **Step 5: Manual spot check with the dev server**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/blog
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/admin/login
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/cursos
kill %1
```

Expected: all four return `200`.

- [ ] **Step 6: Commit**

`git mv` already staged the 11 moves from Step 1. Only the new and modified files from Steps 2–3 need an explicit `git add`:

```bash
git add "src/app/[locale]/(main)/layout.tsx" "src/app/[locale]/layout.tsx"
git status --short
```

Confirm the status output shows only renames (`R`) plus these two files as `A`/`M` — nothing unexpected. Then:

```bash
git commit -m "refactor: move existing routes into (main) route group

Frees up /[locale]/experiencias-ia to have its own layout without
inheriting the main site's Nav/Footer/SiteThemeWrapper. No URL or
behavior changes for existing routes."
```

---

### Task 2: Modelo de datos tipado

**Files:**
- Create: `src/lib/experiencias-ia/data.ts`
- Test: `src/lib/experiencias-ia/__tests__/data.test.ts`

**Interfaces:**
- Consumes: nothing (pure data module).
- Produces: types `EstadoPendiente`, `Pendiente`, `Referencia`, `Concepto`, `EstadoSesion`, `Sesion`, `SesionCronograma`, `Prioridad`, `BacklogItem`, `Participante`, `Principio`, `Grupo`; constants `GRUPO`, `SESIONES`, `CRONOGRAMA`, `BACKLOG`, `PARTICIPANTES`; functions `getSesion(n: number): Sesion | undefined`, `getAdjacentSesiones(n: number): { anterior?: Sesion; siguiente?: Sesion }`, `getUltimasSesiones(count: number): Sesion[]`, `getPendientesAbiertos(): Array<Pendiente & { sesionN: number; sesionTitulo: string }>`, `getMetricas(): { totalSesiones: number; totalIntegrantes: number; pendientesAbiertos: number; temasBacklog: number }`. Every later task that reads group content imports from this module — no other task re-declares this content.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/experiencias-ia/__tests__/data.test.ts
import { describe, it, expect } from 'vitest'
import {
  SESIONES,
  CRONOGRAMA,
  BACKLOG,
  PARTICIPANTES,
  getSesion,
  getAdjacentSesiones,
  getUltimasSesiones,
  getPendientesAbiertos,
  getMetricas,
} from '../data'

describe('getSesion', () => {
  it('returns the session matching n', () => {
    const sesion = getSesion(7)
    expect(sesion?.titulo).toBe('Harness Engineering')
  })

  it('returns undefined for a non-existent session number', () => {
    expect(getSesion(999)).toBeUndefined()
  })
})

describe('getAdjacentSesiones', () => {
  it('has no anterior for the first session', () => {
    const { anterior, siguiente } = getAdjacentSesiones(1)
    expect(anterior).toBeUndefined()
    expect(siguiente?.n).toBe(2)
  })

  it('has no siguiente for the last session', () => {
    const { anterior, siguiente } = getAdjacentSesiones(8)
    expect(anterior?.n).toBe(7)
    expect(siguiente).toBeUndefined()
  })

  it('returns both neighbors for a middle session', () => {
    const { anterior, siguiente } = getAdjacentSesiones(4)
    expect(anterior?.n).toBe(3)
    expect(siguiente?.n).toBe(5)
  })
})

describe('getUltimasSesiones', () => {
  it('returns the N most recent sessions in descending order', () => {
    const ultimas = getUltimasSesiones(3)
    expect(ultimas.map(s => s.n)).toEqual([8, 7, 6])
  })
})

describe('getPendientesAbiertos', () => {
  it('returns exactly the 19 open pendientes across all sessions', () => {
    expect(getPendientesAbiertos()).toHaveLength(19)
  })

  it('each entry carries its originating session number and title', () => {
    const deLaSesion7 = getPendientesAbiertos().filter(p => p.sesionN === 7)
    expect(deLaSesion7).toHaveLength(4)
    expect(deLaSesion7[0].sesionTitulo).toBe('Harness Engineering')
  })

  it('excludes closed pendientes', () => {
    const cerrados = getPendientesAbiertos().filter(p => p.estado === 'cerrado')
    expect(cerrados).toHaveLength(0)
  })
})

describe('getMetricas', () => {
  it('computes all four metrics from the data, not hardcoded values', () => {
    expect(getMetricas()).toEqual({
      totalSesiones: SESIONES.length,
      totalIntegrantes: PARTICIPANTES.length,
      pendientesAbiertos: getPendientesAbiertos().length,
      temasBacklog: BACKLOG.length,
    })
    expect(getMetricas().totalSesiones).toBe(8)
    expect(getMetricas().totalIntegrantes).toBe(18)
    expect(getMetricas().temasBacklog).toBe(12)
  })
})

describe('CRONOGRAMA', () => {
  it('has the 4 upcoming sessions (9-12)', () => {
    expect(CRONOGRAMA.map(s => s.n)).toEqual([9, 10, 11, 12])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run src/lib/experiencias-ia/__tests__/data.test.ts
```

Expected: FAIL — `../data` module does not exist yet.

- [ ] **Step 3: Create `src/lib/experiencias-ia/data.ts`**

```ts
// ============================================================
// Experiencias IA — datos del grupo
// Fuente de verdad original: docs/superpowers/specs/anexos/experiencias-ia/data.js
// Editar aquí para agregar sesiones nuevas o actualizar cronograma/backlog.
// ============================================================

export type EstadoPendiente = 'abierto' | 'cerrado'
export type Pendiente = { quien: string; que: string; estado: EstadoPendiente }
export type Referencia = { titulo: string; nota: string; url: string }
export type Concepto = { t: string; d: string }
export type EstadoSesion = 'cerrada' | 'proxima' | 'planeada'

export type Sesion = {
  n: number
  fecha: string
  fechaLarga: string
  titulo: string
  estado: EstadoSesion
  encargado: string
  destacada?: boolean
  resumenCorto: string
  resumen: string[]
  temas: string[]
  conceptos?: Concepto[]
  decisiones: string[]
  pendientes: Pendiente[]
  referencias: Referencia[]
  nuevos?: string[]
}

export type SesionCronograma = {
  n: number
  fecha: string
  titulo: string
  encargados: string[]
  estado: 'confirmada' | 'propuesta'
  contenido: string[]
}

export type Prioridad = 'alta' | 'media' | 'baja'
export type BacklogItem = { titulo: string; proponente: string; prioridad: Prioridad; nota: string }

export type Participante = {
  nombre: string
  rol: string
  campo: string
  bio: string
  desde: number
  tags: string[]
}

export type Principio = { titulo: string; texto: string }
export type Grupo = {
  nombre: string
  lema: string
  cadencia: string
  lugar: string
  desde: string
  descripcion: string
  principios: Principio[]
}

export const GRUPO: Grupo = {
  nombre: 'Experiencias IA',
  lema: 'Un caballo desbocado necesita riendas, no menos fuerza.',
  cadencia: 'Miércoles, 7:30 – 8:30 p.m. (GMT-5)',
  lugar: 'Medellín, Colombia — remoto',
  desde: '4 de junio de 2026',
  descripcion:
    'Empezó como un grupo de estudio y terminó siendo un círculo de apoyo técnico. Profesionales de desarrollo, datos, finanzas, biología, logística, educación y dirección tecnológica que se juntan una vez por semana a contar qué probaron, qué se les rompió y qué aprendieron con inteligencia artificial. Sin tareas obligatorias. Sin entregables. Con mucha conversación.',
  principios: [
    {
      titulo: 'La IA es colaborador, no reemplazo',
      texto:
        'Multiplicador de capacidades, «ejército de juniors». Requiere supervisión humana constante, juicio crítico y responsabilidad ética de quien la usa.',
    },
    {
      titulo: 'El contexto es el recurso escaso',
      texto:
        'Tokens, ventana de contexto, CLAUDE.md, Proyectos, poda periódica, revelación progresiva. El tema técnico más recurrente de todas las sesiones.',
    },
    {
      titulo: 'Ser dueños del problema',
      texto:
        'Las plataformas absorben funcionalidades a una velocidad imposible de igualar. El valor está en entender el problema, no en competir construyendo herramientas.',
    },
    {
      titulo: 'Sin tareas obligatorias',
      texto:
        'El aprendizaje más caro del grupo: los grupos de estudio con deberes mueren en tres semanas. Los retos existen para tener lenguaje común, no para calificar.',
    },
  ],
}

export const SESIONES: Sesion[] = [
  {
    n: 1,
    fecha: '2026-06-04',
    fechaLarga: '4 de junio de 2026',
    titulo: 'Utilidad, dependencia y ética',
    estado: 'cerrada',
    encargado: 'Sergio Monsalve',
    resumenCorto:
      'Sesión fundacional. Experiencias personales, expectativas del grupo y el primer debate ético sobre alucinaciones.',
    resumen: [
      'Sesión fundacional centrada en experiencias personales y reflexión ética. Se presentó la actividad, los participantes y las expectativas del grupo de estudio.',
      'Cristina Aristizábal contó cómo creó un sitio web funcional para un baby shower usando Claude, sin saber programar. El caso abrió la conversación sobre qué significa realmente «saber hacer» algo con IA.',
      'Jorge Johnson planteó desde el inicio que este no sería un grupo académico como los de astronomía o sesgos cognitivos: aquí las expectativas de cada participante son radicalmente distintas, y esa diversidad es el punto.',
    ],
    temas: ['Ética y alucinaciones', 'Expectativas del grupo', 'Primeros experimentos'],
    decisiones: [
      'El grupo se acota inicialmente a cuatro sesiones para evaluar si continúa.',
      'No se impondrán tareas académicas rígidas.',
    ],
    pendientes: [],
    referencias: [],
  },
  {
    n: 2,
    fecha: '2026-06-09',
    fechaLarga: '9 de junio de 2026',
    titulo: 'Logística, saturación y automatización de flujos',
    estado: 'cerrada',
    encargado: 'Sergio Monsalve',
    resumenCorto:
      'Se fija la cadencia semanal. Aparecen la saturación cognitiva y las skills conectadas a fuentes de datos.',
    resumen: [
      'Se acordó establecer reuniones semanales para fomentar la colaboración técnica, con un grupo de perfiles diversos interesados en desarrollo de software y optimización mediante IA.',
      'Los integrantes discutieron la saturación por la rápida evolución tecnológica y la necesidad de pensamiento crítico. Se validó la utilidad de automatizar procesos repetitivos mediante habilidades conectadas a fuentes de datos.',
      'El uso de sistemas para centralizar contextos y memoria facilita la toma de decisiones. Se destacó la importancia de las herramientas de síntesis para aprender sobre gestión efectiva de contexto.',
    ],
    temas: ['Skills', 'Gestión de contexto', 'Infoxicación', 'Obsidian'],
    decisiones: ['Cadencia definitiva: miércoles de 7:30 a 8:30 p.m.'],
    pendientes: [
      { quien: 'Daniel Moreno Agudelo', que: 'Presentar Skills y el proyecto de base de datos', estado: 'cerrado' },
      { quien: 'Sergio, Diego, Jorge', que: 'Crear página personal aplicando lo discutido', estado: 'abierto' },
      { quien: 'Sergio Monsalve', que: 'Investigar las skills mencionadas por Daniel', estado: 'cerrado' },
      { quien: 'Sergio Monsalve', que: 'Experimentar con Obsidian y compartir un ejercicio', estado: 'abierto' },
    ],
    referencias: [],
  },
  {
    n: 3,
    fecha: '2026-06-10',
    fechaLarga: '10 de junio de 2026',
    titulo: 'Arquitectura, MemPalas y el rol del programador',
    estado: 'cerrada',
    encargado: 'Jorge Johnson',
    resumenCorto:
      'Calidad de software bajo IA, memoria institucional con palacios de memoria y la primera discusión seria de metodología.',
    resumen: [
      'Los participantes discutieron la dependencia de la IA para generar código, enfatizando la necesidad crítica de supervisión humana constante para garantizar arquitectura y mantenibilidad. La conclusión: la IA funciona como asistente que requiere lineamientos estrictos para evitar fallas estructurales.',
      'Juan David Pineda Cárdenas introdujo MemPalas, solución de memoria institucional basada en técnicas nemotécnicas de palacios de memoria y arquitecturas de bases de datos no estructuradas, ya implementada en su oficina.',
      'Jorge Johnson afirmó que las IA actuales no están diseñadas para diseñar software, sino para ejecutar tareas, lo que produce código de mala calidad o repetitivo si no se supervisan constantemente.',
      'Sergio insistió en dividir los proyectos en un backlog de tickets para mantener control sobre los avances.',
    ],
    temas: ['Arquitectura', 'Refactorización', 'Pruebas automatizadas', 'MemPalas', 'Backlog de tickets'],
    decisiones: [
      'Mantener un repositorio compartido para documentar aprendizajes y validar recursos técnicos.',
      'Enfoque flexible: cada integrante comparte sus investigaciones de manera colaborativa.',
    ],
    pendientes: [
      { quien: 'Jorge Johnson', que: 'Distribuir el documento sobre desarrollo asistido con IA', estado: 'cerrado' },
      { quien: 'El grupo', que: 'Evaluar MemPalas para discutirla en futuras sesiones', estado: 'abierto' },
      { quien: 'Sergio y Jorge', que: 'Definir temas principales y formato de sesiones futuras', estado: 'cerrado' },
      { quien: 'El grupo', que: 'Preparar exposición breve (3–5 min) sobre un tema investigado', estado: 'cerrado' },
    ],
    referencias: [],
  },
  {
    n: 4,
    fecha: '2026-06-24',
    fechaLarga: '24 de junio de 2026',
    titulo: 'Consolidación de la comunidad de práctica',
    estado: 'cerrada',
    encargado: 'Jorge Johnson',
    resumenCorto:
      'El grupo pasa de definir logística a operar como comunidad de práctica con presentaciones cortas y repositorio compartido.',
    resumen: [
      'El grupo consolidó su dinámica: tareas de investigación individual, presentaciones cortas, repositorio compartido de recursos y un rol de moderación estable.',
      'Continuaron los hilos sobre gestión de contexto y skills como unidad de trabajo modular, incluyendo el uso de un «skill para crear skills» como camino para profesionalizar el uso de IA.',
    ],
    temas: ['Comunidad de práctica', 'Skill creator', 'Repositorio compartido'],
    decisiones: [],
    pendientes: [],
    referencias: [],
  },
  {
    n: 5,
    fecha: '2026-06-30',
    fechaLarga: '30 de junio – 2 de julio de 2026',
    titulo: 'Jarvis, contexto compartido y el futuro de los dashboards',
    estado: 'cerrada',
    encargado: 'Sergio Monsalve',
    resumenCorto:
      'Asistentes personales tipo Jarvis, sus límites por falta de memoria persistente, y un debate sobre storytelling de datos.',
    resumen: [
      'Diego insistió en la necesidad de contexto compartido en equipos. Se discutió el proyecto «Jarvis» personal —calendario, correo, WhatsApp, Obsidian— y sus límites por falta de memoria persistente.',
      'Andrés presentó su uso de LLMs para generación y calificación de leads según perfil de cliente ideal (ICP).',
      'El cierre fue un debate filosófico sobre creatividad de la IA, el futuro de los dashboards frente al storytelling de datos y la vigencia de la interpretación humana.',
    ],
    temas: ['Jarvis', 'Memoria persistente', 'ICP y leads', 'Dashboards vs. storytelling'],
    decisiones: [],
    pendientes: [],
    referencias: [],
  },
  {
    n: 6,
    fecha: '2026-07-08',
    fechaLarga: '8 de julio de 2026',
    titulo: 'Identidad del grupo y seguridad en código generado',
    estado: 'cerrada',
    encargado: 'Sergio Monsalve',
    resumenCorto:
      'Entra sangre nueva. Se consolida la identidad como comunidad horizontal y se abre el frente de seguridad.',
    resumen: [
      'El grupo consolidó su propósito como comunidad técnica centrada en compartir experiencias sobre IA, priorizando el intercambio horizontal frente a estructuras académicas rígidas.',
      'La discusión subrayó la importancia de la supervisión humana y las pruebas estrictas al implementar IA. Se descartó confiar ciegamente en código generado sin auditoría técnica.',
      'Se decidió reenfocar la enseñanza hacia el uso de IA en lugar de la sintaxis tradicional: el desarrollo evolucionará desde la codificación manual hacia la generación directa de ejecutables.',
      'Juan David Torres recordó por qué funcionan estos grupos: uno no puede estar en siete frentes al mismo tiempo, y llegar a un espacio donde alguien te dice «¿viste tal cosa?» es lo que sostiene el aprendizaje.',
      'Se incorporó Juan Francisco Cardona McCormick.',
    ],
    temas: ['Identidad del grupo', 'Seguridad en código generado', 'Educación e IA', 'Metodología Némesis'],
    decisiones: ['El grupo de WhatsApp se usa para proponer temas y organizar la siguiente sesión.'],
    pendientes: [
      { quien: 'El grupo', que: 'Participar en WhatsApp proponiendo temas y tópicos', estado: 'abierto' },
      { quien: 'Andrés Pérez', que: 'Presentar temas pendientes y compartir experiencias', estado: 'abierto' },
      { quien: 'Diego Fernando Robledo', que: 'Presentar temas pendientes y compartir experiencias', estado: 'abierto' },
      { quien: 'Juan David Torres', que: 'Compartir casos reales de vulnerabilidades en código generado por IA', estado: 'abierto' },
      { quien: 'Jorge Johnson', que: 'Incluir el debate sobre uso académico de IA en las diapositivas', estado: 'abierto' },
      { quien: 'Juan Francisco Cardona McCormick', que: 'Investigar la metodología Némesis para interacción crítica con modelos', estado: 'abierto' },
      { quien: 'Jorge Johnson y Juan Francisco Cardona', que: 'Reunión de café sobre IA general y argumentos prácticos', estado: 'abierto' },
    ],
    referencias: [],
  },
  {
    n: 7,
    fecha: '2026-07-15',
    fechaLarga: '15 de julio de 2026',
    titulo: 'Harness Engineering',
    estado: 'cerrada',
    encargado: 'Sergio Monsalve',
    destacada: true,
    resumenCorto:
      'El caballo, el arnés y el jinete. Las tres capas de ingeniería con LLMs y el patrón de Hashimoto.',
    resumen: [
      'Todo agente de IA funciona hasta que no. Bajo condiciones controladas escriben código, navegan y operan software de forma autónoma. En producción fallan de forma impredecible: no hay memoria entre sesiones, no se sabe cuándo se detienen ni cómo validan su propio trabajo.',
      'El harness engineering es la disciplina de diseñar los sistemas, restricciones y ciclos de retroalimentación que envuelven a un agente para hacerlo confiable en producción. El harness no es el agente: es la infraestructura que gobierna cómo opera, qué herramientas puede invocar, dónde obtiene información, cómo valida decisiones y cómo se detiene.',
      'La metáfora: el modelo es el caballo, el arnés son las riendas y la silla, y el jinete da la dirección. Un buen arnés no previene los errores — hace al agente más capaz dándole contexto, herramientas y las restricciones correctas en el momento correcto. Cada error se convierte en una regla nueva del arnés.',
      'Origen: en febrero de 2026 Mitchell Hashimoto —cocreador de Terraform, fundador de HashiCorp— publica sobre engineering the harness. Semanas después Anthropic y OpenAI publican artículos propios. Martin Fowler lo define como las herramientas y prácticas para mantener a los agentes bajo control.',
      'Convergencia clave: la guía empírica de desarrollo de Jorge Johnson y el marco formal de harness engineering llegan a lo mismo por caminos distintos. Jorge desde el proceso, el harness desde la infraestructura. Specs como fuente de verdad ↔ context delivery. Puerta de plan antes de tocar código ↔ approval gates. Criterios de aceptación binarios ↔ ciclos de verificación. Reglas del proyecto en documentos ↔ configuración del harness.',
      'La tesis más profunda: la fuerza de voluntad no basta. La voluntad no frena el sesgo de automatización; lo que funciona es la fricción productiva, puertas de diseño que obligan a un acto deliberado.',
      'Los mejores arneses se diseñan sabiendo que serán innecesarios a medida que los modelos mejoren.',
    ],
    temas: [
      'Harness Engineering',
      'Patrón de Hashimoto',
      'Tres capas: prompt / context / harness',
      'Fricción productiva',
      'Loop Engineering',
      'Huellas de modelos',
      'OpenRouter',
    ],
    conceptos: [
      { t: 'Prompt engineering', d: 'Un turno.' },
      { t: 'Context engineering', d: 'Una sesión.' },
      {
        t: 'Harness engineering',
        d: 'Trabajo continuo: horas y cientos de decisiones, con herramientas, validación y restricciones arquitectónicas.',
      },
      {
        t: 'Patrón de Hashimoto',
        d: 'Cada error del agente se convierte en un arreglo permanente del entorno. El sistema se realimenta y mejora a sí mismo.',
      },
      {
        t: 'Cinco primitivas',
        d: 'Sistema de archivos, ejecución de código, sandbox controlado, memoria persistente y gestión de contexto.',
      },
    ],
    decisiones: [
      'Se adopta el glosario vivo de 40 términos clave en cuatro categorías: fundamentos, contexto y memoria, seguridad y control, operación y evaluación.',
      'Se comparte un repositorio de aprendizaje con cinco módulos y dos proyectos prácticos.',
      'Jorge Johnson asume formalmente el rol de moderador.',
    ],
    pendientes: [
      { quien: 'El grupo', que: 'Construir colaborativamente el glosario de 40 términos', estado: 'abierto' },
      { quien: 'Diego Fernando Robledo', que: 'Narrar la integración fallida entre Obsidian y Claude', estado: 'abierto' },
      {
        quien: 'José Luis Montoya Pareja',
        que: 'Compartir el video de automatización de talleres de electrónica con sensores (España)',
        estado: 'abierto',
      },
      { quien: 'Juan David Torres', que: 'Profundizar en Loop Engineering como complemento del harness', estado: 'abierto' },
    ],
    referencias: [
      { titulo: 'Mitchell Hashimoto — Engineering the Harness', nota: 'Publicación original, febrero de 2026', url: '' },
      { titulo: 'Martin Fowler — definición de harness', nota: 'Herramientas y prácticas para mantener agentes bajo control', url: '' },
      { titulo: 'Repositorio de aprendizaje del grupo', nota: 'Cinco módulos, dos proyectos', url: '' },
      { titulo: 'OpenRouter', nota: 'Gestión centralizada de múltiples llaves de API', url: '' },
    ],
    nuevos: ['Rafael David Rincón Bermúdez', 'Alejandra Santamaría', 'José Luis Montoya Pareja'],
  },
  {
    n: 8,
    fecha: '2026-07-22',
    fechaLarga: '22 de julio de 2026',
    titulo: 'Agentes en local, infraestructura y democratización',
    estado: 'cerrada',
    encargado: 'Juan David Torres · Sergio Monsalve',
    resumenCorto:
      'Demostración de agentes en entornos aislados, costos de infraestructura local y la IA como mentor de metaaprendizaje.',
    resumen: [
      'Se discutió la implementación de asistentes bajo el concepto de ingeniero de avance. Se acordó desplegar demostraciones iniciales en entornos locales aislados para garantizar la seguridad de los datos.',
      'Los participantes analizaron la necesidad de gestionar infraestructura local para reducir costos operativos a largo plazo, y enfatizaron la importancia de democratizar el acceso al conocimiento frente a barreras financieras.',
      'La combinación de habilidades técnicas con visión ejecutiva fortalece los proyectos colaborativos. El uso de IA como mentor permite potenciar el metaaprendizaje y la adaptación profesional.',
    ],
    temas: ['Agentes locales', 'Infraestructura propia', 'Modelos locales', 'Metaaprendizaje', 'Raspberry Pi'],
    decisiones: ['Las demostraciones de agentes se hacen primero en entornos locales aislados.'],
    pendientes: [
      {
        quien: 'Juan David Torres',
        que: 'Explicar conceptos teóricos básicos de agentes, componentes y funcionamiento',
        estado: 'abierto',
      },
      { quien: 'Sergio Monsalve', que: 'Preparar demostración de un agente funcional', estado: 'abierto' },
      { quien: 'Sergio Monsalve', que: 'Investigar viabilidad de ejecutar agentes en Raspberry Pi', estado: 'abierto' },
      {
        quien: 'Sergio y Juan David Torres',
        que: 'Estructurar curso de preparación para la certificación oficial de Anthropic',
        estado: 'abierto',
      },
      { quien: 'El grupo', que: 'Identificar modelos locales disponibles para tareas', estado: 'abierto' },
    ],
    referencias: [],
  },
]

export const CRONOGRAMA: SesionCronograma[] = [
  {
    n: 9,
    fecha: '29 de julio de 2026',
    titulo: 'Agentes: teoría y demostración práctica',
    encargados: ['Juan David Torres', 'Sergio Monsalve'],
    estado: 'confirmada',
    contenido: [
      'Conceptos teóricos: qué es un agente, sus componentes y cómo funciona.',
      'Demostración en vivo de un agente funcional en entorno local aislado.',
    ],
  },
  {
    n: 10,
    fecha: '5 de agosto de 2026',
    titulo: 'Seguridad en código generado por IA',
    encargados: ['Juan David Torres'],
    estado: 'propuesta',
    contenido: [
      'Casos reales de vulnerabilidades en código generado por modelos.',
      'Prácticas de auditoría antes de llevar código asistido a producción.',
    ],
  },
  {
    n: 11,
    fecha: '12 de agosto de 2026',
    titulo: 'Obsidian, segundo cerebro y memoria persistente',
    encargados: ['Diego Fernando Robledo', 'Pablo Álvarez'],
    estado: 'propuesta',
    contenido: [
      'La integración fallida Obsidian ↔ Claude, contada en detalle.',
      'Centralización de contextos de cliente en un segundo cerebro.',
    ],
  },
  {
    n: 12,
    fecha: '19 de agosto de 2026',
    titulo: 'IA en la academia y en la formación',
    encargados: ['Jorge Johnson', 'Rafael David Rincón', 'José Luis Montoya'],
    estado: 'propuesta',
    contenido: [
      'Uso académico de la IA y la justificación de trabajos.',
      'Especificación y requisitos como disciplina previa al código.',
    ],
  },
]

export const BACKLOG: BacklogItem[] = [
  {
    titulo: 'Curso de preparación para la certificación oficial de Anthropic',
    proponente: 'Sergio Monsalve · Juan David Torres',
    prioridad: 'alta',
    nota: 'Estructurar programa de formación. Sesión 8.',
  },
  {
    titulo: 'Glosario vivo de 40 términos',
    proponente: 'El grupo',
    prioridad: 'alta',
    nota: 'Fundamentos, contexto y memoria, seguridad y control, operación y evaluación. Sesión 7.',
  },
  {
    titulo: 'Loop Engineering',
    proponente: 'Juan David Torres',
    prioridad: 'alta',
    nota: 'Complemento del harness engineering para desarrollo con agentes.',
  },
  {
    titulo: 'Agentes en Raspberry Pi',
    proponente: 'Sergio Monsalve',
    prioridad: 'media',
    nota: 'Viabilidad técnica de ejecución en hardware modesto.',
  },
  {
    titulo: 'Modelos locales disponibles',
    proponente: 'El grupo',
    prioridad: 'media',
    nota: 'Inventario de modelos ejecutables sin nube.',
  },
  {
    titulo: 'MemPalas — memoria institucional',
    proponente: 'Juan David Pineda Cárdenas',
    prioridad: 'media',
    nota: 'Palacios de memoria aplicados a memoria organizacional. Sesión 3.',
  },
  {
    titulo: 'Metodología Némesis',
    proponente: 'Juan Francisco Cardona McCormick',
    prioridad: 'media',
    nota: 'Interacción crítica y adversarial con modelos.',
  },
  {
    titulo: 'Huellas y sesgos de modelos',
    proponente: 'Juan David Torres',
    prioridad: 'media',
    nota: 'Estilos de escritura identificables por modelo.',
  },
  {
    titulo: 'El futuro de los dashboards',
    proponente: 'Andrés Pérez',
    prioridad: 'baja',
    nota: 'Storytelling de datos frente al tablero tradicional. Sesión 5.',
  },
  {
    titulo: 'Vibe Engineering',
    proponente: 'Juan David Torres',
    prioridad: 'media',
    nota: 'Crítica a la ilusión de velocidad y la deuda técnica acumulada. Libro en curso.',
  },
  {
    titulo: 'Automatización de talleres de electrónica con sensores',
    proponente: 'José Luis Montoya Pareja',
    prioridad: 'baja',
    nota: 'Video de la experiencia en España.',
  },
  {
    titulo: 'Agilismo en la era de la IA',
    proponente: 'Carlos Eduardo Monsalve',
    prioridad: 'baja',
    nota: '¿Hay un retorno a fases de análisis tipo cascada?',
  },
]

export const PARTICIPANTES: Participante[] = [
  {
    nombre: 'Sergio Monsalve',
    rol: 'Organizador y anfitrión',
    campo: 'Emprendimiento · Producto',
    bio: 'Fundó el grupo desde una inquietud personal por entender qué estaba pasando en el mundo. Plataforma de cursos «Songo Sorongo» con infraestructura propia; cerró exitosamente un negocio de cultivo de hongos con apoyo de IA. Explora Obsidian, biblioteca digital personal, generación multimedia y un asistente tipo Jarvis. Gestiona la IA como «un ejército de juniors» al que hay que entrenar con lineamientos. Aficionado al parapente.',
    desde: 1,
    tags: ['Skills', 'Obsidian', 'Jarvis', 'Documentación'],
  },
  {
    nombre: 'Jorge Johnson',
    rol: 'Moderador y jefe de disciplina',
    campo: 'Desarrollo de software',
    bio: 'Desarrollador veterano y voz crítica del grupo. Su proyecto insignia es «Catalejo», software de astronomía —simulación de Saturno y Júpiter, catálogos Hipparcos/ESA— escrito en «punk», un lenguaje de programación propio creado con asistencia de IA. Mantiene 9.350 pruebas automatizadas y un archivo cordura.md con reglas para la IA. Escéptico de la automatización total, defensor de la supervisión rigurosa. Quiere presentar su software en un planetario.',
    desde: 1,
    tags: ['Catalejo', 'punk', 'Testing', 'Escepticismo productivo'],
  },
  {
    nombre: 'Juan David Torres',
    rol: 'Investigación y experimentación',
    campo: 'Ingeniería de datos',
    bio: 'Aporta la mirada histórica: compara el salto tecnológico del siglo XX con el momento actual, donde se gestan cinco innovaciones simultáneas —blockchain pública, almacenamiento de energía, IA, robótica y secuenciamiento multiómico—. Investiga huellas de modelos, despliegue eficiente de agentes y optimización de consumo de RAM. Autor del libro en curso «Vibe Engineering».',
    desde: 1,
    tags: ['Agentes', 'OpenRouter', 'Vibe Engineering', 'Seguridad'],
  },
  {
    nombre: 'Diego Fernando Robledo',
    rol: 'Práctica aplicada',
    campo: 'Ingeniería de datos · Globant',
    bio: 'Usa agentes para leer repositorios de GitHub, convertir SQL a modelos DBT y automatizar documentación y PRs. Frustrado con herramientas corporativas como Cortex de Snowflake. Desarrolló su página personal con Superpowers y Cloudflare. Conecta el grupo con su rol de padre —hijo estudiando mecatrónica— y con la academia. Tiene pendiente el proyecto «Domus».',
    desde: 1,
    tags: ['DBT', 'Agentes', 'Obsidian', 'Domus'],
  },
  {
    nombre: 'Daniel Moreno Agudelo',
    rol: 'Referente en Skills',
    campo: 'Finanzas y cooperación internacional · Sabio',
    bio: 'El más avanzado del grupo en Skills: automatización de reportes financieros, exploración de bases NoSQL con MongoDB, conexión con ERP y CRM. Promotor de la revelación progresiva y del marco GSD. Construye un agente personal que resume su correo. Explora también el concepto Jarvis con Obsidian.',
    desde: 1,
    tags: ['Skills', 'MongoDB', 'Revelación progresiva', 'GSD'],
  },
  {
    nombre: 'Juan Pablo Duque Ochoa',
    rol: 'Referente técnico y estratégico',
    campo: 'Consultoría',
    bio: 'Enfatiza fundamentos —RAG, MCP—, encapsulamiento, modularidad, poda de contexto y el skill creator de Anthropic. Articuló la estrategia de servicios híbridos y la idea de «ser dueños del problema». Verbalizó la paradoja emocional que genera el ritmo de la IA.',
    desde: 1,
    tags: ['RAG', 'MCP', 'Estrategia', 'Skill creator'],
  },
  {
    nombre: 'Cristina Aristizábal Johnson',
    rol: 'Diseño, estrategia e investigación',
    campo: 'Diseño · Ámbito jurídico',
    bio: 'Creó un sitio web funcional para un baby shower sin saber programar — el caso que abrió la primera sesión. Busca profesionalizar el uso de IA en sus distintos roles. Aportó la mirada ética sobre alucinaciones en Derecho y Medicina.',
    desde: 1,
    tags: ['Ética', 'Diseño', 'No-code'],
  },
  {
    nombre: 'Carlos Eduardo Monsalve',
    rol: 'Gobernanza y liderazgo',
    campo: 'Dirección de tecnología',
    bio: 'Enfocado en liderazgo y gobernanza de IA más que en ejecución técnica. Aportó datos de industria —80% del código de Anthropic generado por IA—, el concepto de «infoxicación» de Alfons Cornella y el debate sobre agilismo y posibles retornos a fases de análisis tipo cascada. Trabaja en definir gobierno, estrategia y presupuesto de IA para su organización.',
    desde: 1,
    tags: ['Gobernanza', 'Estrategia', 'Infoxicación'],
  },
  {
    nombre: 'Juan David Pineda Cárdenas',
    rol: 'DevOps / Tech Lead',
    campo: 'Linux y hardware',
    bio: 'Perfil técnico Linux y hardware —configuración de firmware por Bluetooth—. Presentó MemPalas, herramienta de memoria institucional basada en palacios de memoria, ya implementada en su oficina. Valora el grupo como espacio de intercambio intelectual sin tareas obligatorias, y fue de los primeros en frenar cualquier intento de imponer deberes.',
    desde: 1,
    tags: ['MemPalas', 'Linux', 'Firmware'],
  },
  {
    nombre: 'Pablo Álvarez',
    rol: 'Estrategia de marca',
    campo: 'Ingeniería mecánica · Agencia',
    bio: 'Ingeniero mecánico en agencia de estrategia y conceptualización de marca. Usuario intensivo de Claude. Promotor del «segundo cerebro» con Obsidian para centralizar contextos de clientes y conectar ideas.',
    desde: 2,
    tags: ['Obsidian', 'Segundo cerebro', 'Marca'],
  },
  {
    nombre: 'Nicolás Montoya',
    rol: 'Producción creativa',
    campo: 'Audiovisual',
    bio: 'Metodología en tres capas: Claude para planeación y razonamiento, modelos menores para ejecución, humano en el ciclo. Trabaja con Eleven Labs para clonación de voz, Gemini, edición y Touch Designer para experiencias inmersivas reactivas al sonido. Hoy entrega repositorios de GitHub completos y organizados gracias a la IA.',
    desde: 2,
    tags: ['Eleven Labs', 'Touch Designer', 'Multimodal'],
  },
  {
    nombre: 'Jorge González',
    rol: 'Colaborador',
    campo: 'Ingeniería electrónica · Globant',
    bio: 'Su afición al aeromodelismo lo reconectó con la ingeniería electrónica. Los LLMs le facilitan programación y automatización en sus pasatiempos.',
    desde: 2,
    tags: ['Aeromodelismo', 'Electrónica'],
  },
  {
    nombre: 'Andrés Pérez',
    rol: 'Aplicación comercial',
    campo: 'Logística',
    bio: 'Usa LLMs para generación y calificación de leads según perfil de cliente ideal (ICP), y skills personalizadas como un asistente mecánico que consulta manuales y foros para diagnóstico vehicular. Planteó el debate sobre el futuro de los dashboards.',
    desde: 3,
    tags: ['ICP', 'Skills', 'Logística'],
  },
  {
    nombre: 'Juan Francisco Cardona McCormick',
    rol: 'Perspectiva crítica',
    campo: 'Ingeniería',
    bio: 'Se incorporó en la sesión 6. Introdujo la metodología Némesis como enfoque de interacción crítica y adversarial con los modelos. Interesado en el debate sobre inteligencia artificial general y sus argumentos prácticos.',
    desde: 6,
    tags: ['Némesis', 'AGI', 'Pensamiento crítico'],
  },
  {
    nombre: 'Rafael David Rincón Bermúdez',
    rol: 'Especificación y requisitos',
    campo: 'Academia · Profesor universitario retirado',
    bio: 'Experto en requisitos y especificación. Su llegada refuerza la línea del grupo sobre specs como fuente de verdad y criterios de aceptación binarios.',
    desde: 7,
    tags: ['Requisitos', 'Especificación', 'Academia'],
  },
  {
    nombre: 'Alejandra Santamaría',
    rol: 'Ingeniería aplicada',
    campo: 'Ingeniería biológica',
    bio: 'Ingeniera biológica. Colabora con Sergio en un curso de robótica con ESP32, ampliando el alcance del grupo hacia hardware y educación técnica.',
    desde: 7,
    tags: ['ESP32', 'Robótica', 'Biología'],
  },
  {
    nombre: 'José Luis Montoya Pareja',
    rol: 'Educación y comunidad',
    campo: 'Ingeniería de sistemas · Docencia',
    bio: 'Reconocido profesor de ingeniería de sistemas y creador de comunidad. Trabaja en automatización de talleres de electrónica con sensores, proyecto desarrollado en España.',
    desde: 7,
    tags: ['Docencia', 'Sensores', 'Comunidad'],
  },
  {
    nombre: 'Martín Gonzalo Aguilar',
    rol: 'Participación puntual',
    campo: 'Aviación',
    bio: 'Trayectoria en aviación. Participación puntual en las sesiones iniciales.',
    desde: 1,
    tags: ['Aviación'],
  },
]

export function getSesion(n: number): Sesion | undefined {
  return SESIONES.find(sesion => sesion.n === n)
}

export function getAdjacentSesiones(n: number): { anterior?: Sesion; siguiente?: Sesion } {
  return {
    anterior: SESIONES.find(sesion => sesion.n === n - 1),
    siguiente: SESIONES.find(sesion => sesion.n === n + 1),
  }
}

export function getUltimasSesiones(count: number): Sesion[] {
  return [...SESIONES].sort((a, b) => b.n - a.n).slice(0, count)
}

export function getPendientesAbiertos(): Array<Pendiente & { sesionN: number; sesionTitulo: string }> {
  return SESIONES.flatMap(sesion =>
    sesion.pendientes
      .filter(p => p.estado === 'abierto')
      .map(p => ({ ...p, sesionN: sesion.n, sesionTitulo: sesion.titulo }))
  )
}

export function getMetricas() {
  return {
    totalSesiones: SESIONES.length,
    totalIntegrantes: PARTICIPANTES.length,
    pendientesAbiertos: getPendientesAbiertos().length,
    temasBacklog: BACKLOG.length,
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run src/lib/experiencias-ia/__tests__/data.test.ts
```

Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add src/lib/experiencias-ia/
git commit -m "feat(experiencias-ia): add typed data module

Transcribed from docs/superpowers/specs/anexos/experiencias-ia/data.js —
the group's real session notes, cronograma, backlog, and participants.
Includes derived functions (getPendientesAbiertos, getMetricas, etc.)
so metrics and the open-pendientes panel are computed, never
hand-duplicated."
```

---

### Task 3: CSS scoped "cuaderno del ingeniero" + layout de la sección + nav de 5 vistas

**Files:**
- Create: `src/app/[locale]/experiencias-ia/experiencias-ia.css`
- Create: `src/components/experiencias-ia/ExperienciasNav.tsx`
- Create: `src/app/[locale]/experiencias-ia/layout.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: CSS classes used by every later component/page in this section: `.experiencias-ia`, `.wrap`, `.eyebrow`, `.lema`, `.exp-nav`, `.exp-nav-links`, `.exp-brand`, `.exp-back`, `.capas`/`.capa`, `.grid`/`.g2`/`.g3`/`.g4`, `.card`/`.card.hl`, `.ses-list`/`.ses-row`/`.ses-num`/`.ses-t`/`.ses-d`/`.ses-f`, `.det-cols`, `.side-box`, `.pendiente`/`.pendiente-estado`, `.filtro-prioridad`/`.filtro-btn`, `.prioridad`, `.estado-badge`, `.metrica`/`.metrica-valor`/`.metrica-label`, `.tag`, `.ses-nav`, `.prose`. `ExperienciasNav` component (client component, no props).

- [ ] **Step 1: Create the scoped CSS file**

```css
/* src/app/[locale]/experiencias-ia/experiencias-ia.css */

.experiencias-ia {
  --tinta: #141b1f;
  --tinta-2: #3d4a52;
  --papel: #e9e5db;
  --papel-2: #dfd9cc;
  --cuero: #8a4b2a;
  --laton: #b08d3f;
  --verde: #3f6b4e;
  --linea: rgba(20, 27, 31, 0.16);
  --linea-fuerte: rgba(20, 27, 31, 0.4);

  --display: var(--font-bricolage), system-ui, sans-serif;
  --serif: var(--font-newsreader), Georgia, serif;
  --mono: var(--font-jetbrains), ui-monospace, monospace;

  font-family: var(--serif);
  background: var(--papel);
  color: var(--tinta);
  font-size: 17px;
  line-height: 1.62;
  min-height: 100vh;
  background-image: linear-gradient(var(--linea) 1px, transparent 1px),
    linear-gradient(90deg, var(--linea) 1px, transparent 1px);
  background-size: 100% 34px, 34px 100%;
}

.experiencias-ia * {
  box-sizing: border-box;
}

.experiencias-ia .wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 28px;
}

@media (max-width: 640px) {
  .experiencias-ia .wrap {
    padding: 0 18px;
  }
}

.experiencias-ia h1 {
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(32px, 6vw, 58px);
  line-height: 0.98;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
}

.experiencias-ia h2 {
  font-family: var(--display);
  font-weight: 600;
  font-size: clamp(22px, 3.2vw, 32px);
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin-bottom: 14px;
}

.experiencias-ia h3 {
  font-family: var(--display);
  font-weight: 600;
  font-size: 19px;
  letter-spacing: -0.015em;
  margin-bottom: 8px;
}

.experiencias-ia p + p {
  margin-top: 12px;
}

.experiencias-ia .prose p {
  margin-bottom: 14px;
  max-width: 68ch;
}

.experiencias-ia ul {
  padding-left: 20px;
  margin: 12px 0;
}

.experiencias-ia li {
  margin-bottom: 6px;
}

.experiencias-ia .eyebrow {
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cuero);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.experiencias-ia .eyebrow::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--linea-fuerte);
}

.experiencias-ia .lema {
  font-family: var(--serif);
  font-style: italic;
  font-size: 20px;
  line-height: 1.4;
  border-left: 3px solid var(--cuero);
  padding-left: 16px;
  margin: 20px 0;
  max-width: 44ch;
}

.experiencias-ia a {
  color: var(--cuero);
}

.experiencias-ia a:focus-visible,
.experiencias-ia button:focus-visible {
  outline: 2px solid var(--cuero);
  outline-offset: 2px;
}

/* Nav */
.experiencias-ia .exp-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(233, 229, 219, 0.93);
  border-bottom: 1.5px solid var(--tinta);
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.experiencias-ia .exp-nav-links {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}

.experiencias-ia .exp-nav-links a {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 8px 11px;
  color: var(--tinta-2);
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.experiencias-ia .exp-nav-links a:hover {
  color: var(--tinta);
}

.experiencias-ia .exp-nav-links a.on {
  color: var(--cuero);
  border-bottom-color: var(--cuero);
  font-weight: 600;
}

.experiencias-ia .exp-brand {
  font-family: var(--display);
  font-weight: 800;
  font-size: 17px;
  letter-spacing: -0.03em;
  color: var(--tinta);
  text-decoration: none;
}

.experiencias-ia .exp-back {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--tinta-2);
}

.experiencias-ia .exp-back:hover {
  color: var(--cuero);
}

/* Diagrama de capas (harness) — elemento de firma */
.experiencias-ia .capas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1.5px solid var(--tinta);
  background: var(--papel-2);
  margin-top: 32px;
}

.experiencias-ia .capa {
  padding: 22px 18px;
  border-right: 1px solid var(--linea-fuerte);
}

.experiencias-ia .capa:last-child {
  border-right: none;
}

.experiencias-ia .capa:nth-child(3) {
  background: linear-gradient(180deg, rgba(138, 75, 42, 0.09), rgba(138, 75, 42, 0.02));
}

.experiencias-ia .capa:nth-child(3) b {
  color: var(--cuero);
}

.experiencias-ia .capa i {
  font-family: var(--mono);
  font-style: normal;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--tinta-2);
}

.experiencias-ia .capa b {
  display: block;
  font-family: var(--display);
  font-size: 18px;
  font-weight: 600;
  margin: 6px 0 4px;
}

.experiencias-ia .capa p {
  font-size: 14px;
  line-height: 1.5;
  color: var(--tinta-2);
}

@media (max-width: 720px) {
  .experiencias-ia .capas {
    grid-template-columns: 1fr;
  }
  .experiencias-ia .capa {
    border-right: none;
    border-bottom: 1px solid var(--linea-fuerte);
  }
  .experiencias-ia .capa:last-child {
    border-bottom: none;
  }
}

/* Tarjetas / grids */
.experiencias-ia .grid {
  display: grid;
  gap: 1.5px;
  background: var(--tinta);
  border: 1.5px solid var(--tinta);
  margin-top: 8px;
}

.experiencias-ia .g2 {
  grid-template-columns: repeat(2, 1fr);
}

.experiencias-ia .g3 {
  grid-template-columns: repeat(3, 1fr);
}

.experiencias-ia .g4 {
  grid-template-columns: repeat(4, 1fr);
}

.experiencias-ia .card {
  background: var(--papel);
  padding: 22px 20px;
}

.experiencias-ia .card.hl {
  background: var(--papel-2);
}

@media (max-width: 860px) {
  .experiencias-ia .g3,
  .experiencias-ia .g4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .experiencias-ia .g2,
  .experiencias-ia .g3,
  .experiencias-ia .g4 {
    grid-template-columns: 1fr;
  }
}

/* Índice de sesiones */
.experiencias-ia .ses-list {
  border-top: 1.5px solid var(--tinta);
  margin-top: 22px;
}

.experiencias-ia .ses-row {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 18px 6px;
  border-bottom: 1px solid var(--linea-fuerte);
  text-decoration: none;
  color: inherit;
}

.experiencias-ia .ses-row:hover {
  background: rgba(138, 75, 42, 0.06);
}

.experiencias-ia .ses-num {
  font-family: var(--display);
  font-weight: 800;
  font-size: 30px;
  letter-spacing: -0.05em;
  color: var(--linea-fuerte);
}

.experiencias-ia .ses-row:hover .ses-num {
  color: var(--cuero);
}

.experiencias-ia .ses-t {
  display: block;
  font-family: var(--display);
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 3px;
}

.experiencias-ia .ses-d {
  display: block;
  font-size: 14px;
  color: var(--tinta-2);
}

.experiencias-ia .ses-f {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--tinta-2);
  white-space: nowrap;
  text-decoration: none;
}

@media (max-width: 640px) {
  .experiencias-ia .ses-row {
    grid-template-columns: 40px 1fr;
  }
  .experiencias-ia .ses-f {
    grid-column: 2;
    text-align: left;
  }
}

/* Detalle de sesión */
.experiencias-ia .det-cols {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
  margin-top: 24px;
  align-items: start;
}

@media (max-width: 900px) {
  .experiencias-ia .det-cols {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}

.experiencias-ia .side-box {
  border: 1.5px solid var(--tinta);
  padding: 18px;
  margin-bottom: 18px;
  background: var(--papel-2);
}

.experiencias-ia .side-box h4 {
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: var(--cuero);
  font-weight: 600;
}

.experiencias-ia .ses-nav {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  border-top: 1.5px solid var(--tinta);
  margin-top: 40px;
  padding-top: 20px;
}

.experiencias-ia .ses-nav a {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--cuero);
}

/* Pendientes */
.experiencias-ia .pendiente {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dotted var(--linea-fuerte);
  font-size: 14px;
}

.experiencias-ia .pendiente.cerrado {
  opacity: 0.55;
  text-decoration: line-through;
}

.experiencias-ia .pendiente-estado {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 8px;
  border: 1px solid currentColor;
  white-space: nowrap;
  text-decoration: none;
}

.experiencias-ia .pendiente-estado.abierto {
  color: var(--cuero);
}

.experiencias-ia .pendiente-estado.cerrado {
  color: var(--verde);
}

/* Backlog */
.experiencias-ia .filtro-prioridad {
  display: flex;
  gap: 8px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.experiencias-ia .filtro-btn {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 7px 14px;
  border: 1.5px solid var(--tinta);
  background: var(--papel);
  color: var(--tinta);
  cursor: pointer;
}

.experiencias-ia .filtro-btn.on {
  background: var(--tinta);
  color: var(--papel);
}

.experiencias-ia .prioridad {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 8px;
  display: inline-block;
  margin-bottom: 8px;
}

.experiencias-ia .prioridad.alta {
  background: var(--cuero);
  color: var(--papel);
}

.experiencias-ia .prioridad.media {
  background: var(--laton);
  color: var(--tinta);
}

.experiencias-ia .prioridad.baja {
  background: var(--papel-2);
  color: var(--tinta-2);
  border: 1px solid var(--linea-fuerte);
}

/* Cronograma */
.experiencias-ia .estado-badge {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 8px;
  display: inline-block;
  margin-bottom: 8px;
}

.experiencias-ia .estado-badge.confirmada {
  background: var(--verde);
  color: var(--papel);
}

.experiencias-ia .estado-badge.propuesta {
  background: var(--laton);
  color: var(--tinta);
}

/* Métricas */
.experiencias-ia .metrica {
  text-align: left;
}

.experiencias-ia .metrica-valor {
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.03em;
  color: var(--cuero);
}

.experiencias-ia .metrica-label {
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tinta-2);
  margin-top: 4px;
}

/* Participantes */
.experiencias-ia .tag {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border: 1px solid var(--linea-fuerte);
  color: var(--tinta-2);
  display: inline-block;
  margin: 2px 4px 2px 0;
}

@media (prefers-reduced-motion: reduce) {
  .experiencias-ia * {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: Create `ExperienciasNav`**

```tsx
// src/components/experiencias-ia/ExperienciasNav.tsx
'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'

const VISTAS = [
  { href: '/experiencias-ia', label: 'Inicio' },
  { href: '/experiencias-ia/sesiones', label: 'Sesiones' },
  { href: '/experiencias-ia/cronograma', label: 'Cronograma' },
  { href: '/experiencias-ia/backlog', label: 'Backlog' },
  { href: '/experiencias-ia/quienes-somos', label: 'Quiénes somos' },
] as const

export default function ExperienciasNav() {
  const pathname = usePathname()

  return (
    <nav className="exp-nav">
      <Link href="/experiencias-ia" className="exp-brand">
        Experiencias IA
      </Link>
      <div className="exp-nav-links">
        {VISTAS.map(vista => {
          const isActive =
            vista.href === '/experiencias-ia'
              ? pathname.endsWith('/experiencias-ia')
              : pathname.includes(vista.href)
          return (
            <Link key={vista.href} href={vista.href} className={isActive ? 'on' : undefined}>
              {vista.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Create `experiencias-ia/layout.tsx`**

```tsx
// src/app/[locale]/experiencias-ia/layout.tsx
import { Bricolage_Grotesque, Newsreader } from 'next/font/google'
import ExperienciasNav from '@/components/experiencias-ia/ExperienciasNav'
import { Link } from '@/i18n/navigation'
import './experiencias-ia.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
})
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
})

export default function ExperienciasIALayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`experiencias-ia ${bricolage.variable} ${newsreader.variable}`}>
      <ExperienciasNav />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {children}
      </div>
      <footer className="wrap" style={{ borderTop: '1.5px solid var(--tinta)', padding: '20px 0' }}>
        <Link href="/" className="exp-back">
          ← sergiomonsalve.com
        </Link>
      </footer>
    </div>
  )
}
```

- [ ] **Step 4: Verify it compiles and lints**

```bash
npm run lint
npx tsc --noEmit
```

Expected: no new errors introduced by these three files (pre-existing unrelated lint errors elsewhere in the repo are fine — confirm none mention `experiencias-ia`).

- [ ] **Step 5: Commit**

```bash
git add src/app/\[locale\]/experiencias-ia/experiencias-ia.css \
        src/app/\[locale\]/experiencias-ia/layout.tsx \
        src/components/experiencias-ia/ExperienciasNav.tsx
git commit -m "feat(experiencias-ia): add scoped CSS, layout, and 5-view nav

'Cuaderno del ingeniero' visual identity (papel/tinta/cuero), fully
scoped under .experiencias-ia so it never leaks into the main site's
dark theme."
```

---

### Task 4: `PendienteBadge`

**Files:**
- Create: `src/components/experiencias-ia/PendienteBadge.tsx`
- Test: `src/components/experiencias-ia/__tests__/PendienteBadge.test.tsx`

**Interfaces:**
- Consumes: `EstadoPendiente` from `@/lib/experiencias-ia/data` (Task 2).
- Produces: `PendienteBadge({ quien, que, estado }: { quien: string; que: string; estado: EstadoPendiente })` — used by Task 9 (detalle de sesión).

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/experiencias-ia/__tests__/PendienteBadge.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PendienteBadge from '../PendienteBadge'

describe('PendienteBadge', () => {
  it('renders quien and que', () => {
    render(<PendienteBadge quien="Sergio Monsalve" que="Investigar skills" estado="abierto" />)
    expect(screen.getByText('Sergio Monsalve')).toBeInTheDocument()
    expect(screen.getByText(/Investigar skills/)).toBeInTheDocument()
  })

  it('does not apply the cerrado class when estado is abierto', () => {
    const { container } = render(<PendienteBadge quien="Sergio" que="Tarea" estado="abierto" />)
    expect(container.querySelector('.pendiente')).not.toHaveClass('cerrado')
  })

  it('applies the cerrado class but keeps the text visible when estado is cerrado', () => {
    const { container } = render(<PendienteBadge quien="Sergio" que="Tarea" estado="cerrado" />)
    expect(container.querySelector('.pendiente')).toHaveClass('cerrado')
    expect(screen.getByText('Tarea', { exact: false })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/experiencias-ia/__tests__/PendienteBadge.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
// src/components/experiencias-ia/PendienteBadge.tsx
import type { EstadoPendiente } from '@/lib/experiencias-ia/data'

export default function PendienteBadge({
  quien,
  que,
  estado,
}: {
  quien: string
  que: string
  estado: EstadoPendiente
}) {
  return (
    <div className={`pendiente${estado === 'cerrado' ? ' cerrado' : ''}`}>
      <span>
        <strong>{quien}</strong> — {que}
      </span>
      <span className={`pendiente-estado ${estado}`}>{estado}</span>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/experiencias-ia/__tests__/PendienteBadge.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/experiencias-ia/PendienteBadge.tsx src/components/experiencias-ia/__tests__/PendienteBadge.test.tsx
git commit -m "feat(experiencias-ia): add PendienteBadge component"
```

---

### Task 5: `ReferenciaItem`, `CapasHarness`, `MetricaTile`, `PrincipioCard`, `SesionRow`, `ParticipanteCard`

**Files:**
- Create: `src/components/experiencias-ia/ReferenciaItem.tsx`
- Create: `src/components/experiencias-ia/CapasHarness.tsx`
- Create: `src/components/experiencias-ia/MetricaTile.tsx`
- Create: `src/components/experiencias-ia/PrincipioCard.tsx`
- Create: `src/components/experiencias-ia/SesionRow.tsx`
- Create: `src/components/experiencias-ia/ParticipanteCard.tsx`

**Interfaces:**
- Consumes: `Referencia`, `Principio`, `Sesion`, `Participante` types from `@/lib/experiencias-ia/data` (Task 2).
- Produces: `ReferenciaItem({ referencia })`, `CapasHarness()`, `MetricaTile({ valor, label })`, `PrincipioCard({ principio })`, `SesionRow({ sesion })`, `ParticipanteCard({ participante })` — all consumed by pages in Tasks 7–11. These are presentational-only (no interactive state), so no dedicated tests — covered indirectly by the page-level manual verification in Task 12.

- [ ] **Step 1: `ReferenciaItem` — never fabricate a link**

```tsx
// src/components/experiencias-ia/ReferenciaItem.tsx
import type { Referencia } from '@/lib/experiencias-ia/data'

export default function ReferenciaItem({ referencia }: { referencia: Referencia }) {
  if (!referencia.url) {
    return (
      <p>
        <strong>{referencia.titulo}</strong>
        {referencia.nota && <> — {referencia.nota}</>}
      </p>
    )
  }

  return (
    <p>
      <a href={referencia.url} target="_blank" rel="noopener noreferrer">
        <strong>{referencia.titulo}</strong>
      </a>
      {referencia.nota && <> — {referencia.nota}</>}
    </p>
  )
}
```

- [ ] **Step 2: `CapasHarness` — el diagrama de firma (prompt/context/harness), contenido tomado literalmente de los `conceptos` de la Sesión 7**

```tsx
// src/components/experiencias-ia/CapasHarness.tsx
const CAPAS = [
  { i: 'Un turno', b: 'Prompt engineering', p: 'Un turno.' },
  { i: 'Una sesión', b: 'Context engineering', p: 'Una sesión.' },
  {
    i: 'Trabajo continuo',
    b: 'Harness engineering',
    p: 'Horas y cientos de decisiones, con herramientas, validación y restricciones arquitectónicas.',
  },
] as const

export default function CapasHarness() {
  return (
    <div className="capas">
      {CAPAS.map(capa => (
        <div className="capa" key={capa.b}>
          <i>{capa.i}</i>
          <b>{capa.b}</b>
          <p>{capa.p}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: `MetricaTile`**

```tsx
// src/components/experiencias-ia/MetricaTile.tsx
export default function MetricaTile({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="metrica">
      <div className="metrica-valor">{valor}</div>
      <div className="metrica-label">{label}</div>
    </div>
  )
}
```

- [ ] **Step 4: `PrincipioCard`**

```tsx
// src/components/experiencias-ia/PrincipioCard.tsx
import type { Principio } from '@/lib/experiencias-ia/data'

export default function PrincipioCard({ principio }: { principio: Principio }) {
  return (
    <div className="card">
      <h3>{principio.titulo}</h3>
      <p>{principio.texto}</p>
    </div>
  )
}
```

- [ ] **Step 5: `SesionRow`**

```tsx
// src/components/experiencias-ia/SesionRow.tsx
import { Link } from '@/i18n/navigation'
import type { Sesion } from '@/lib/experiencias-ia/data'

export default function SesionRow({ sesion }: { sesion: Sesion }) {
  return (
    <Link href={`/experiencias-ia/sesiones/${sesion.n}`} className="ses-row">
      <span className="ses-num">{String(sesion.n).padStart(2, '0')}</span>
      <span>
        <span className="ses-t">{sesion.titulo}</span>
        <span className="ses-d">{sesion.resumenCorto}</span>
      </span>
      <span className="ses-f">{sesion.fechaLarga}</span>
    </Link>
  )
}
```

- [ ] **Step 6: `ParticipanteCard`**

```tsx
// src/components/experiencias-ia/ParticipanteCard.tsx
import type { Participante } from '@/lib/experiencias-ia/data'

export default function ParticipanteCard({ participante }: { participante: Participante }) {
  return (
    <div className="card">
      <h3>{participante.nombre}</h3>
      <p className="ses-d">
        {participante.rol} · {participante.campo}
      </p>
      <p>{participante.bio}</p>
      <div>
        {participante.tags.map(tag => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/experiencias-ia/ReferenciaItem.tsx \
        src/components/experiencias-ia/CapasHarness.tsx \
        src/components/experiencias-ia/MetricaTile.tsx \
        src/components/experiencias-ia/PrincipioCard.tsx \
        src/components/experiencias-ia/SesionRow.tsx \
        src/components/experiencias-ia/ParticipanteCard.tsx
git commit -m "feat(experiencias-ia): add presentational components

ReferenciaItem, CapasHarness, MetricaTile, PrincipioCard, SesionRow,
ParticipanteCard."
```

---

### Task 6: Página Inicio

**Files:**
- Create: `src/app/[locale]/experiencias-ia/page.tsx`

**Interfaces:**
- Consumes: `GRUPO`, `getMetricas`, `getUltimasSesiones` (Task 2); `CapasHarness`, `MetricaTile`, `PrincipioCard`, `SesionRow` (Task 5).

- [ ] **Step 1: Implement**

```tsx
// src/app/[locale]/experiencias-ia/page.tsx
import type { Metadata } from 'next'
import { GRUPO, getMetricas, getUltimasSesiones } from '@/lib/experiencias-ia/data'
import CapasHarness from '@/components/experiencias-ia/CapasHarness'
import MetricaTile from '@/components/experiencias-ia/MetricaTile'
import PrincipioCard from '@/components/experiencias-ia/PrincipioCard'
import SesionRow from '@/components/experiencias-ia/SesionRow'

export const metadata: Metadata = {
  title: 'Experiencias IA',
  description: GRUPO.descripcion,
}

export default function ExperienciasIAHomePage() {
  const metricas = getMetricas()
  const ultimasSesiones = getUltimasSesiones(3)

  return (
    <div>
      <p className="eyebrow">
        {GRUPO.cadencia} · {GRUPO.lugar}
      </p>
      <h1>{GRUPO.nombre}</h1>
      <p className="lema">&ldquo;{GRUPO.lema}&rdquo;</p>
      <p>{GRUPO.descripcion}</p>

      <CapasHarness />

      <div className="grid g4" style={{ marginTop: 40 }}>
        <div className="card">
          <MetricaTile valor={metricas.totalSesiones} label="Sesiones" />
        </div>
        <div className="card">
          <MetricaTile valor={metricas.totalIntegrantes} label="Integrantes" />
        </div>
        <div className="card">
          <MetricaTile valor={metricas.pendientesAbiertos} label="Pendientes abiertos" />
        </div>
        <div className="card">
          <MetricaTile valor={metricas.temasBacklog} label="Temas en backlog" />
        </div>
      </div>

      <h2 style={{ marginTop: 48 }}>Principios</h2>
      <div className="grid g2">
        {GRUPO.principios.map(principio => (
          <PrincipioCard key={principio.titulo} principio={principio} />
        ))}
      </div>

      <h2 style={{ marginTop: 48 }}>Últimas sesiones</h2>
      <div className="ses-list">
        {ultimasSesiones.map(sesion => (
          <SesionRow key={sesion.n} sesion={sesion} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manual verification**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia
kill %1
```

Expected: `200`. Then open `http://localhost:3000/es/experiencias-ia` in a browser and confirm: hero renders with lema, the 3-column capas diagram shows, 4 metric tiles show non-zero numbers, 4 principios render, and the last 3 sessions (8, 7, 6) list with working links.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/experiencias-ia/page.tsx"
git commit -m "feat(experiencias-ia): add Inicio page"
```

---

### Task 7: Índice de sesiones

**Files:**
- Create: `src/app/[locale]/experiencias-ia/sesiones/page.tsx`

**Interfaces:**
- Consumes: `SESIONES` (Task 2), `SesionRow` (Task 5).

- [ ] **Step 1: Implement**

```tsx
// src/app/[locale]/experiencias-ia/sesiones/page.tsx
import type { Metadata } from 'next'
import { SESIONES } from '@/lib/experiencias-ia/data'
import SesionRow from '@/components/experiencias-ia/SesionRow'

export const metadata: Metadata = {
  title: 'Sesiones — Experiencias IA',
}

export default function SesionesIndexPage() {
  const sesionesOrdenadas = [...SESIONES].sort((a, b) => b.n - a.n)

  return (
    <div>
      <p className="eyebrow">Bitácora</p>
      <h1>Sesiones</h1>
      <div className="ses-list">
        {sesionesOrdenadas.map(sesion => (
          <SesionRow key={sesion.n} sesion={sesion} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manual verification**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/sesiones
kill %1
```

Expected: `200`. Open in browser and confirm all 8 sessions list in order 8→1.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/experiencias-ia/sesiones/page.tsx"
git commit -m "feat(experiencias-ia): add sesiones index page"
```

---

### Task 8: Detalle de sesión

**Files:**
- Create: `src/app/[locale]/experiencias-ia/sesiones/[n]/page.tsx`

**Interfaces:**
- Consumes: `SESIONES`, `getSesion`, `getAdjacentSesiones` (Task 2); `PendienteBadge` (Task 4); `ReferenciaItem` (Task 5).

- [ ] **Step 1: Implement**

```tsx
// src/app/[locale]/experiencias-ia/sesiones/[n]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { SESIONES, getSesion, getAdjacentSesiones } from '@/lib/experiencias-ia/data'
import PendienteBadge from '@/components/experiencias-ia/PendienteBadge'
import ReferenciaItem from '@/components/experiencias-ia/ReferenciaItem'

export function generateStaticParams() {
  return SESIONES.map(sesion => ({ n: String(sesion.n) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>
}): Promise<Metadata> {
  const { n } = await params
  const sesion = getSesion(Number(n))
  if (!sesion) return {}
  return {
    title: `Sesión ${sesion.n}: ${sesion.titulo} — Experiencias IA`,
    description: sesion.resumenCorto,
  }
}

export default async function SesionDetallePage({
  params,
}: {
  params: Promise<{ n: string }>
}) {
  const { n } = await params
  const sesion = getSesion(Number(n))
  if (!sesion) notFound()

  const { anterior, siguiente } = getAdjacentSesiones(sesion.n)

  return (
    <div>
      <p className="eyebrow">
        Sesión {String(sesion.n).padStart(2, '0')} · {sesion.fechaLarga} · {sesion.encargado}
      </p>
      <h1>{sesion.titulo}</h1>

      <div className="det-cols">
        <div className="prose">
          {sesion.resumen.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}

          {sesion.conceptos && sesion.conceptos.length > 0 && (
            <>
              <h2>Conceptos</h2>
              <div className="grid g2">
                {sesion.conceptos.map(concepto => (
                  <div className="card" key={concepto.t}>
                    <h3>{concepto.t}</h3>
                    <p>{concepto.d}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {sesion.decisiones.length > 0 && (
            <>
              <h2>Decisiones</h2>
              <ul>
                {sesion.decisiones.map((decision, i) => (
                  <li key={i}>{decision}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          {sesion.pendientes.length > 0 && (
            <div className="side-box">
              <h4>Pendientes</h4>
              {sesion.pendientes.map((pendiente, i) => (
                <PendienteBadge key={i} quien={pendiente.quien} que={pendiente.que} estado={pendiente.estado} />
              ))}
            </div>
          )}

          {sesion.temas.length > 0 && (
            <div className="side-box">
              <h4>Temas</h4>
              {sesion.temas.map(tema => (
                <span className="tag" key={tema}>
                  {tema}
                </span>
              ))}
            </div>
          )}

          {sesion.nuevos && sesion.nuevos.length > 0 && (
            <div className="side-box">
              <h4>Nuevos integrantes</h4>
              {sesion.nuevos.map(nombre => (
                <p key={nombre}>{nombre}</p>
              ))}
            </div>
          )}

          {sesion.referencias.length > 0 && (
            <div className="side-box">
              <h4>Referencias</h4>
              {sesion.referencias.map((referencia, i) => (
                <ReferenciaItem key={i} referencia={referencia} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="ses-nav">
        {anterior ? (
          <Link href={`/experiencias-ia/sesiones/${anterior.n}`}>
            ← Sesión {anterior.n}: {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {siguiente ? (
          <Link href={`/experiencias-ia/sesiones/${siguiente.n}`}>
            Sesión {siguiente.n}: {siguiente.titulo} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manual verification — the acceptance-critical session (7) and both extremes (1, 8)**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/sesiones/1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/sesiones/7
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/sesiones/8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/sesiones/99
kill %1
```

Expected: `200`, `200`, `200`, `404`. Open Sesión 7 in a browser and confirm: 5 conceptos render, all 4 referencias render as plain text (no broken empty links), and the 3 nuevos integrantes list. Open Sesión 1 and confirm no "anterior" link renders; open Sesión 8 and confirm no "siguiente" link renders.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/experiencias-ia/sesiones/[n]/page.tsx"
git commit -m "feat(experiencias-ia): add sesion detail page

Prev/next navigation, conceptos, decisiones, pendientes with visual
state, temas, nuevos integrantes, and references (plain text when
the source URL is empty, never a fabricated link)."
```

---

### Task 9: Cronograma con panel de pendientes abiertos

**Files:**
- Create: `src/app/[locale]/experiencias-ia/cronograma/page.tsx`

**Interfaces:**
- Consumes: `CRONOGRAMA`, `getPendientesAbiertos` (Task 2).

- [ ] **Step 1: Implement**

```tsx
// src/app/[locale]/experiencias-ia/cronograma/page.tsx
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { CRONOGRAMA, getPendientesAbiertos } from '@/lib/experiencias-ia/data'

export const metadata: Metadata = {
  title: 'Cronograma — Experiencias IA',
}

export default function CronogramaPage() {
  const pendientesAbiertos = getPendientesAbiertos()

  return (
    <div>
      <p className="eyebrow">Próximas sesiones</p>
      <h1>Cronograma</h1>

      <div className="grid g2" style={{ marginTop: 24 }}>
        {CRONOGRAMA.map(sesion => (
          <div className="card" key={sesion.n}>
            <span className={`estado-badge ${sesion.estado}`}>{sesion.estado}</span>
            <h3>
              Sesión {sesion.n}: {sesion.titulo}
            </h3>
            <p className="ses-d">
              {sesion.fecha} · {sesion.encargados.join(', ')}
            </p>
            <ul>
              {sesion.contenido.map((punto, i) => (
                <li key={i}>{punto}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 48 }}>Pendientes abiertos</h2>
      <div className="side-box">
        {pendientesAbiertos.length === 0 && <p>No hay pendientes abiertos.</p>}
        {pendientesAbiertos.map((pendiente, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <p style={{ marginBottom: 2 }}>
              <strong>{pendiente.quien}</strong> — {pendiente.que}
            </p>
            <Link href={`/experiencias-ia/sesiones/${pendiente.sesionN}`} className="ses-f">
              Sesión {pendiente.sesionN}: {pendiente.sesionTitulo}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manual verification**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/cronograma
kill %1
```

Expected: `200`. Confirm sessions 9–12 render with correct `confirmada`/`propuesta` badges, and the pendientes panel shows exactly 19 items (matches `getPendientesAbiertos()` from Task 2's test), each linking to its origin session.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/experiencias-ia/cronograma/page.tsx"
git commit -m "feat(experiencias-ia): add cronograma page with open-pendientes panel

Panel is derived from getPendientesAbiertos() across all sessions —
not a hand-maintained duplicate list."
```

---

### Task 10: Backlog con filtro por prioridad

**Files:**
- Create: `src/components/experiencias-ia/BacklogFilter.tsx`
- Test: `src/components/experiencias-ia/__tests__/BacklogFilter.test.tsx`
- Create: `src/app/[locale]/experiencias-ia/backlog/page.tsx`

**Interfaces:**
- Consumes: `BacklogItem`, `Prioridad`, `BACKLOG` (Task 2).
- Produces: `BacklogFilter({ items: BacklogItem[] })` — client component with its own filter state, used only by this page.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/experiencias-ia/__tests__/BacklogFilter.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BacklogFilter from '../BacklogFilter'
import type { BacklogItem } from '@/lib/experiencias-ia/data'

const items: BacklogItem[] = [
  { titulo: 'Tema alta', proponente: 'Sergio', prioridad: 'alta', nota: 'nota alta' },
  { titulo: 'Tema media', proponente: 'Jorge', prioridad: 'media', nota: 'nota media' },
  { titulo: 'Tema baja', proponente: 'Diego', prioridad: 'baja', nota: 'nota baja' },
]

describe('BacklogFilter', () => {
  it('renders all items by default', () => {
    render(<BacklogFilter items={items} />)
    expect(screen.getByText('Tema alta')).toBeInTheDocument()
    expect(screen.getByText('Tema media')).toBeInTheDocument()
    expect(screen.getByText('Tema baja')).toBeInTheDocument()
  })

  it('filters to only alta priority items when Alta is clicked', () => {
    render(<BacklogFilter items={items} />)
    fireEvent.click(screen.getByText('Alta'))
    expect(screen.getByText('Tema alta')).toBeInTheDocument()
    expect(screen.queryByText('Tema media')).not.toBeInTheDocument()
    expect(screen.queryByText('Tema baja')).not.toBeInTheDocument()
  })

  it('shows all items again when Todas is clicked after filtering', () => {
    render(<BacklogFilter items={items} />)
    fireEvent.click(screen.getByText('Media'))
    fireEvent.click(screen.getByText('Todas'))
    expect(screen.getByText('Tema alta')).toBeInTheDocument()
    expect(screen.getByText('Tema media')).toBeInTheDocument()
    expect(screen.getByText('Tema baja')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/experiencias-ia/__tests__/BacklogFilter.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `BacklogFilter`**

```tsx
// src/components/experiencias-ia/BacklogFilter.tsx
'use client'

import { useState } from 'react'
import type { BacklogItem, Prioridad } from '@/lib/experiencias-ia/data'

const OPCIONES: Array<{ value: Prioridad | 'todas'; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
]

export default function BacklogFilter({ items }: { items: BacklogItem[] }) {
  const [filtro, setFiltro] = useState<Prioridad | 'todas'>('todas')
  const visibles = filtro === 'todas' ? items : items.filter(item => item.prioridad === filtro)

  return (
    <div>
      <div className="filtro-prioridad">
        {OPCIONES.map(opcion => (
          <button
            key={opcion.value}
            type="button"
            className={`filtro-btn${filtro === opcion.value ? ' on' : ''}`}
            onClick={() => setFiltro(opcion.value)}
          >
            {opcion.label}
          </button>
        ))}
      </div>
      <div className="grid g2">
        {visibles.map(item => (
          <div className="card" key={item.titulo}>
            <span className={`prioridad ${item.prioridad}`}>{item.prioridad}</span>
            <h3>{item.titulo}</h3>
            <p className="ses-d">{item.proponente}</p>
            <p>{item.nota}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/experiencias-ia/__tests__/BacklogFilter.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Create the backlog page**

```tsx
// src/app/[locale]/experiencias-ia/backlog/page.tsx
import type { Metadata } from 'next'
import { BACKLOG } from '@/lib/experiencias-ia/data'
import BacklogFilter from '@/components/experiencias-ia/BacklogFilter'

export const metadata: Metadata = {
  title: 'Backlog — Experiencias IA',
}

export default function BacklogPage() {
  return (
    <div>
      <p className="eyebrow">Temas propuestos</p>
      <h1>Backlog</h1>
      <BacklogFilter items={BACKLOG} />
    </div>
  )
}
```

- [ ] **Step 6: Manual verification**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/backlog
kill %1
```

Expected: `200`. Open in browser, confirm 12 temas render, and clicking Alta/Media/Baja/Todas filters correctly.

- [ ] **Step 7: Commit**

```bash
git add src/components/experiencias-ia/BacklogFilter.tsx \
        src/components/experiencias-ia/__tests__/BacklogFilter.test.tsx \
        "src/app/[locale]/experiencias-ia/backlog/page.tsx"
git commit -m "feat(experiencias-ia): add backlog page with priority filter"
```

---

### Task 11: Quiénes somos

**Files:**
- Create: `src/app/[locale]/experiencias-ia/quienes-somos/page.tsx`

**Interfaces:**
- Consumes: `GRUPO`, `PARTICIPANTES` (Task 2); `ParticipanteCard` (Task 5).

- [ ] **Step 1: Implement**

```tsx
// src/app/[locale]/experiencias-ia/quienes-somos/page.tsx
import type { Metadata } from 'next'
import { GRUPO, PARTICIPANTES } from '@/lib/experiencias-ia/data'
import ParticipanteCard from '@/components/experiencias-ia/ParticipanteCard'

export const metadata: Metadata = {
  title: 'Quiénes somos — Experiencias IA',
}

export default function QuienesSomosPage() {
  return (
    <div>
      <p className="eyebrow">El grupo</p>
      <h1>Quiénes somos</h1>
      <p>{GRUPO.descripcion}</p>

      <h2 style={{ marginTop: 40 }}>Cómo funciona</h2>
      <div className="grid g2">
        {GRUPO.principios.map(principio => (
          <div className="card" key={principio.titulo}>
            <h3>{principio.titulo}</h3>
            <p>{principio.texto}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 40 }}>Integrantes</h2>
      <div className="grid g3">
        {PARTICIPANTES.map(participante => (
          <ParticipanteCard key={participante.nombre} participante={participante} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manual verification**

```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es/experiencias-ia/quienes-somos
kill %1
```

Expected: `200`. Confirm all 18 participant cards render with nombre, rol, campo, bio, tags; and the 4 principios render under "Cómo funciona".

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/experiencias-ia/quienes-somos/page.tsx"
git commit -m "feat(experiencias-ia): add quienes-somos page"
```

---

### Task 12: Enlace en el Nav principal

**Files:**
- Modify: `src/components/Nav.tsx`
- Modify: `src/messages/es.json`
- Modify: `src/messages/en.json`

**Interfaces:**
- Consumes: nothing new (existing `nav` translation namespace).

- [ ] **Step 1: Add the translation key**

In `src/messages/es.json`, inside the `"nav"` object, add a new key right after `"guestbook"`:

```json
  "nav": {
    "about": "Sobre mí",
    "blog": "Blog",
    "portfolio": "Portfolio",
    "recipes": "Recetas",
    "cursos": "Cursos",
    "biblioteca": "Biblioteca",
    "guestbook": "Firmas",
    "experienciasIa": "Experiencias IA",
    "contact": "Contacto"
  },
```

In `src/messages/en.json`, same position, same value (the group's content is Spanish-only, but the nav label is a proper noun so it stays untranslated):

```json
  "nav": {
    "about": "About",
    "blog": "Blog",
    "portfolio": "Portfolio",
    "recipes": "Recipes",
    "cursos": "Courses",
    "biblioteca": "Library",
    "guestbook": "Guestbook",
    "experienciasIa": "Experiencias IA",
    "contact": "Contact"
  },
```

- [ ] **Step 2: Add the link in `Nav.tsx`**

In `src/components/Nav.tsx`, add a new `<Link>` right after the guestbook link and before the contact link:

```tsx
        <Link href="/guestbook" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('guestbook')}
        </Link>
        <Link href="/experiencias-ia" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('experienciasIa')}
        </Link>
        <Link href="/contact" className="text-xs text-text-secondary hover:text-text transition-colors">
          {t('contact')}
        </Link>
```

- [ ] **Step 3: Verify**

```bash
npm run lint
npx tsc --noEmit
npm run test:run
```

Expected: no errors; `Nav.test.tsx` still passes (it's a no-op placeholder, see file — RTL can't render this async server component).

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.tsx src/messages/es.json src/messages/en.json
git commit -m "feat(nav): add Experiencias IA link to main site navigation"
```

---

### Task 13: Verificación final

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

```bash
npm run test:run
```

Expected: all tests pass, including the new `data.test.ts`, `PendienteBadge.test.tsx`, `BacklogFilter.test.tsx`.

- [ ] **Step 2: Lint and typecheck**

```bash
npm run lint
npx tsc --noEmit
```

Expected: no errors introduced by this feature (ignore pre-existing unrelated lint errors elsewhere in the repo, if any — confirm none reference `experiencias-ia`).

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: succeeds; route list includes `/[locale]/experiencias-ia`, `/[locale]/experiencias-ia/sesiones`, `/[locale]/experiencias-ia/sesiones/[n]` (statically generated for n=1..8), `/[locale]/experiencias-ia/cronograma`, `/[locale]/experiencias-ia/backlog`, `/[locale]/experiencias-ia/quienes-somos` — alongside all pre-existing `(main)` routes unchanged.

- [ ] **Step 4: Mobile-width check at 360px**

```bash
npm run dev &
sleep 3
```

Open Chrome DevTools device toolbar, set width to 360px, and visit each of the 6 views (`/es/experiencias-ia`, `/es/experiencias-ia/sesiones`, `/es/experiencias-ia/sesiones/7`, `/es/experiencias-ia/cronograma`, `/es/experiencias-ia/backlog`, `/es/experiencias-ia/quienes-somos`). Confirm no horizontal scrollbar appears on any of them, and the nav wraps or scrolls without breaking layout.

```bash
kill %1
```

- [ ] **Step 5: Re-verify every acceptance criterion from the spec**

Go through `docs/superpowers/specs/2026-07-23-experiencias-ia-design.md` section 8 checkbox by checkbox and confirm each one against the running dev server. Check off every box in the spec file itself once confirmed.

- [ ] **Step 6: Commit the checked-off spec**

```bash
git add docs/superpowers/specs/2026-07-23-experiencias-ia-design.md
git commit -m "docs: check off acceptance criteria for Experiencias IA"
```
