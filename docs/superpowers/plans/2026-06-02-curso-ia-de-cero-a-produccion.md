# Curso "De Cero a Producción con IA" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poblar la infraestructura de cursos existente con el curso "De Cero a Producción con IA" — estructura en Supabase, repositorio template para participantes, y contenido MDX de las 15 sesiones.

**Architecture:** La plataforma de cursos en sergiomonsalve.com ya está construida (enrollment, progress tracking, lesson content via MDX en Supabase). La implementación se divide en tres artefactos: (1) seed script que crea el curso, sus 5 módulos y 15 lecciones en Supabase; (2) repositorio público `ia-cero-produccion-template` en GitHub que los participantes forkean en la Sesión 3; (3) contenido MDX de cada sesión, escrito sprint por sprint y cargado al DB.

**Tech Stack:** Supabase (PostgreSQL), Next.js 15 App Router, Tailwind CSS v4, TypeScript, `@supabase/supabase-js`, Vercel

---

## Archivos a crear/modificar

| Archivo | Propósito |
|---|---|
| `scripts/seed-curso-ia.ts` | Script que inserta curso, módulos y lecciones en Supabase |
| `content/cursos/sprint-1/sesion-1.mdx` | Guía de sesión: El mapa de la IA |
| `content/cursos/sprint-1/sesion-2.mdx` | Guía de sesión: Prompting que funciona |
| `content/cursos/sprint-1/sesion-3.mdx` | Guía de sesión: Primer deploy |
| `content/cursos/sprint-2/sesion-4.mdx` | Guía de sesión: Git |
| `content/cursos/sprint-2/sesion-5.mdx` | Guía de sesión: Leer código con IA |
| `content/cursos/sprint-2/sesion-6.mdx` | Guía de sesión: Diseño con IA |
| `content/cursos/sprint-3/sesion-7.mdx` | Guía de sesión: Bases de datos |
| `content/cursos/sprint-3/sesion-8.mdx` | Guía de sesión: Conectar BD al sitio |
| `content/cursos/sprint-3/sesion-9.mdx` | Guía de sesión: Contenido dinámico |
| `content/cursos/sprint-4/sesion-10.mdx` | Guía de sesión: CI/CD |
| `content/cursos/sprint-4/sesion-11.mdx` | Guía de sesión: Dominio + Auth |
| `content/cursos/sprint-4/sesion-12.mdx` | Guía de sesión: SEO + Lanzamiento |
| `content/cursos/sprint-5/sesion-13.mdx` | Guía de sesión: APIs de IA |
| `content/cursos/sprint-5/sesion-14.mdx` | Guía de sesión: Chatbot personal |
| `content/cursos/sprint-5/sesion-15.mdx` | Guía de sesión: Embeddings + RAG |
| `scripts/upload-lesson-content.ts` | Script que lee MDX files y los sube a Supabase |
| Repositorio externo: `ia-cero-produccion-template` | Starter Next.js que participantes forkean en Sesión 3 |

---

## Task 1: Script de seed — estructura del curso en Supabase

**Archivos:**
- Crear: `scripts/seed-curso-ia.ts`

> Prerequisito: tener `SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_SUPABASE_URL` en `.env.local`. El schema de Supabase ya existe (tablas `courses`, `modules`, `lessons` ya creadas por la infraestructura existente).

- [ ] **Step 1: Crear el script de seed**

```typescript
// scripts/seed-curso-ia.ts
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COURSE_SLUG = 'ia-de-cero-a-produccion'

const modules = [
  {
    title: 'Sprint 1 — IA + Primer Deploy',
    description: 'Entender el paisaje de la IA y tener un sitio en producción desde la primera semana.',
    order: 1,
    lessons: [
      { title: 'El mapa de la IA', description: 'LLMs, tokens, contexto, landscape de modelos y terminología esencial.', order: 1, duration_minutes: 90 },
      { title: 'Prompting que funciona', description: 'Anatomía de un buen prompt, prompting iterativo y límites reales de los modelos.', order: 2, duration_minutes: 90 },
      { title: 'Primer deploy', description: 'Fork de template, edición con IA y primer deploy en Vercel. Tu URL pública.', order: 3, duration_minutes: 90 },
    ]
  },
  {
    title: 'Sprint 2 — Developer Stack + Git',
    description: 'Flujo de trabajo profesional con Git y lectura de código con IA como copiloto.',
    order: 2,
    lessons: [
      { title: 'Git: el historial que salva vidas', description: 'Repositorio, commit, branch, merge, pull request. El flujo push → deploy automático.', order: 1, duration_minutes: 90 },
      { title: 'Leer código con IA como copiloto', description: 'Estructura de Next.js, componentes, y cómo usar Claude para entender código real.', order: 2, duration_minutes: 90 },
      { title: 'Diseño con IA: que se vea tuyo', description: 'Tailwind CSS, diseño responsivo y personalización de identidad visual con IA.', order: 3, duration_minutes: 90 },
    ]
  },
  {
    title: 'Sprint 3 — Supabase + Base de Datos',
    description: 'El sitio deja de ser estático. Guardar y leer datos reales con IA escribiendo SQL y backend.',
    order: 3,
    lessons: [
      { title: 'Bases de datos: el cerebro del sitio', description: 'SQL básico, Supabase, variables de entorno y seguridad de credenciales.', order: 1, duration_minutes: 90 },
      { title: 'Conectar la base de datos al sitio', description: 'API Routes en Next.js, variables de entorno en Vercel, Row Level Security básico.', order: 2, duration_minutes: 90 },
      { title: 'Contenido dinámico: el sitio cobra vida', description: 'Formulario de contacto completo con validación, guardado en Supabase y página admin.', order: 3, duration_minutes: 90 },
    ]
  },
  {
    title: 'Sprint 4 — Vercel + Producción Real',
    description: 'Dominio propio, autenticación y flujo de trabajo de equipo real.',
    order: 4,
    lessons: [
      { title: 'CI/CD: el deploy que se cuida solo', description: 'Preview deployments, ambientes, variables por ambiente y logs en Vercel.', order: 1, duration_minutes: 90 },
      { title: 'Dominio propio + Autenticación', description: 'DNS, Namecheap, Supabase Auth con magic link y rutas protegidas.', order: 2, duration_minutes: 90 },
      { title: 'SEO, performance y lanzamiento oficial', description: 'Metadata, OG images, Core Web Vitals, Lighthouse y lanzamiento grupal.', order: 3, duration_minutes: 90 },
    ]
  },
  {
    title: 'Sprint 5 — IA Nativa en el Sitio',
    description: 'La IA vive adentro del sitio: APIs, chatbot personal y búsqueda semántica.',
    order: 5,
    lessons: [
      { title: 'APIs de IA: hablar con los modelos desde código', description: 'Vercel AI SDK, providers, streaming y estimación de costos.', order: 1, duration_minutes: 90 },
      { title: 'Chatbot personal: la IA que te conoce', description: 'System prompts, historial de conversación y useChat de Vercel AI SDK.', order: 2, duration_minutes: 90 },
      { title: 'Embeddings, RAG y qué sigue', description: 'Embeddings, búsqueda semántica con pgvector en Supabase y graduación del grupo.', order: 3, duration_minutes: 90 },
    ]
  },
]

async function seed() {
  console.log('🌱 Seeding curso:', COURSE_SLUG)

  // Upsert course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .upsert({
      title: 'De Cero a Producción con IA',
      slug: COURSE_SLUG,
      description: 'Desde el primer prompt hasta una página personal desplegada con IA nativa. Herramientas, stack moderno, GitHub, Supabase y Vercel.',
      is_free: true,
      is_published: true,
      thumbnail_url: null,
    }, { onConflict: 'slug' })
    .select('id')
    .single()

  if (courseError || !course) {
    console.error('Error creating course:', courseError)
    process.exit(1)
  }

  console.log('✅ Course:', course.id)

  for (const mod of modules) {
    const { lessons: lessonDefs, ...modData } = mod

    const { data: module, error: modError } = await supabase
      .from('modules')
      .upsert({ ...modData, course_id: course.id }, { onConflict: 'course_id,order' })
      .select('id')
      .single()

    if (modError || !module) {
      console.error('Error creating module:', mod.title, modError)
      process.exit(1)
    }

    console.log(`  ✅ Module ${mod.order}: ${mod.title}`)

    for (const lesson of lessonDefs) {
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({ ...lesson, module_id: module.id }, { onConflict: 'module_id,order' })

      if (lessonError) {
        console.error('Error creating lesson:', lesson.title, lessonError)
        process.exit(1)
      }

      console.log(`    ✅ Lesson ${lesson.order}: ${lesson.title}`)
    }
  }

  console.log('\n🎉 Seed completo!')
}

seed()
```

- [ ] **Step 2: Verificar que el conflict target es correcto**

Abrir Supabase Dashboard → Table Editor → tabla `modules`. Confirmar que existe un unique constraint en `(course_id, order)`. Si no existe, crear en SQL Editor:

```sql
ALTER TABLE modules ADD CONSTRAINT modules_course_id_order_key UNIQUE (course_id, "order");
ALTER TABLE lessons ADD CONSTRAINT lessons_module_id_order_key UNIQUE (module_id, "order");
```

- [ ] **Step 3: Ejecutar el seed**

```bash
npx tsx scripts/seed-curso-ia.ts
```

Resultado esperado:
```
🌱 Seeding curso: ia-de-cero-a-produccion
✅ Course: <uuid>
  ✅ Module 1: Sprint 1 — IA + Primer Deploy
    ✅ Lesson 1: El mapa de la IA
    ✅ Lesson 2: Prompting que funciona
    ✅ Lesson 3: Primer deploy
  ✅ Module 2: Sprint 2 — Developer Stack + Git
    ...
🎉 Seed completo!
```

- [ ] **Step 4: Verificar en Supabase Dashboard**

Ir a Table Editor → `courses`. Confirmar que existe el registro con `slug = 'ia-de-cero-a-produccion'` y `is_published = true`. Abrir `modules` y filtrar por `course_id` → deben aparecer 5 módulos. Abrir `lessons` → deben aparecer 15 lecciones.

- [ ] **Step 5: Verificar que el curso aparece en el sitio**

```bash
npm run dev
```

Navegar a `http://localhost:3000/es/cursos`. Confirmar que aparece el card del curso con título, descripción, 5 módulos y 15 lecciones.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed-curso-ia.ts
git commit -m "feat(cursos): add seed script for De Cero a Producción con IA"
```

---

## Task 2: Repositorio template para participantes

> Este es un repositorio GitHub separado (`sergiomonsalve/ia-cero-produccion-template`), no parte del repo principal. Los pasos aquí describen cómo crearlo localmente y subirlo.

**Descripción:** El starter que cada participante forkea en la Sesión 3. Debe ser un Next.js 15 + Tailwind v4 mínimo, con estructura de contenido placeholder (nombre, bio, proyectos, contacto), listo para que Vercel lo despliegue con un clic y el participante lo personalice con IA.

- [ ] **Step 1: Crear el repositorio localmente**

```bash
# En un directorio fuera del repo principal
cd ~/Code
npx create-next-app@latest ia-cero-produccion-template \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd ia-cero-produccion-template
```

- [ ] **Step 2: Simplificar la estructura al mínimo**

Reemplazar `app/page.tsx` con:

```tsx
// app/page.tsx
export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-20 font-mono">
      <p className="text-sm text-emerald-400 mb-2">// tu-nombre.com</p>
      <h1 className="text-4xl font-bold text-white mb-4">
        Hola, soy [Tu Nombre]
      </h1>
      <p className="text-gray-400 mb-12 leading-relaxed">
        [Una oración sobre quién eres y qué haces. La IA te ayudará a escribir esto.]
      </p>

      <section className="mb-12">
        <h2 className="text-xs text-emerald-400 mb-4">// proyectos</h2>
        <div className="space-y-4">
          <div className="border border-gray-800 p-4 rounded">
            <h3 className="text-white font-semibold">[Nombre del proyecto]</h3>
            <p className="text-gray-400 text-sm mt-1">[Descripción breve]</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs text-emerald-400 mb-4">// contacto</h2>
        <p className="text-gray-400 text-sm">
          <a href="mailto:[tu@email.com]" className="text-emerald-400 hover:underline">
            [tu@email.com]
          </a>
        </p>
      </section>
    </main>
  )
}
```

- [ ] **Step 3: Configurar el tema oscuro en Tailwind**

Reemplazar `app/globals.css` con:

```css
@import "tailwindcss";

:root {
  --background: #0f0f0f;
  --foreground: #ededed;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 4: Agregar `vercel.json` para deploy con un clic**

```json
{
  "framework": "nextjs"
}
```

- [ ] **Step 5: Escribir el README con instrucciones claras**

```markdown
# Mi Sitio Personal — Curso "De Cero a Producción con IA"

Este es el template que usarás durante el curso para construir tu página personal.

## Cómo empezar (Sesión 3)

1. Haz click en **Fork** (arriba a la derecha en GitHub)
2. Conecta tu fork a Vercel en [vercel.com/new](https://vercel.com/new)
3. Despliega con un clic — tu sitio estará en línea en ~60 segundos

## Estructura

```
app/
  page.tsx      ← tu página principal (aquí vive casi todo por ahora)
  layout.tsx    ← estructura base y fuentes
  globals.css   ← colores y estilos globales
```

## Personalizar con IA

Pégale este prompt a Claude:
> "Tengo este archivo page.tsx: [pega el contenido]. Mi nombre es [nombre], soy [profesión] y trabajo en [empresa/proyecto]. Reescribe el contenido placeholder con información real sobre mí. Mantén exactamente la misma estructura de componentes."
```

- [ ] **Step 6: Commit inicial y push a GitHub**

```bash
git add -A
git commit -m "initial: starter template for De Cero a Producción con IA course"
```

Crear el repo en GitHub (`sergiomonsalve/ia-cero-produccion-template`) como **público**, luego:

```bash
git remote add origin https://github.com/sergiomonsalve/ia-cero-produccion-template.git
git push -u origin main
```

- [ ] **Step 7: Agregar Deploy to Vercel badge al README**

Agregar al inicio del README:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sergiomonsalve/ia-cero-produccion-template)
```

---

## Task 3: Script de carga de contenido MDX a Supabase

**Archivos:**
- Crear: `scripts/upload-lesson-content.ts`
- Crear: `content/cursos/` (directorio con archivos MDX por sesión)

> Los archivos MDX de cada sesión se escriben localmente (Tasks 4-8) y este script los sube a la columna `content_mdx` de la tabla `lessons` en Supabase.

- [ ] **Step 1: Crear el script de upload**

```typescript
// scripts/upload-lesson-content.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COURSE_SLUG = 'ia-de-cero-a-produccion'
const CONTENT_DIR = join(process.cwd(), 'content/cursos')

// Map: "sprint-1/sesion-1.mdx" → { module_order: 1, lesson_order: 1 }
function parseFilePath(relativePath: string): { moduleOrder: number; lessonOrder: number } | null {
  const match = relativePath.match(/sprint-(\d+)\/sesion-(\d+)\.mdx/)
  if (!match) return null
  return { moduleOrder: parseInt(match[1]), lessonOrder: parseInt(match[2]) }
}

async function upload() {
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', COURSE_SLUG)
    .single()

  if (!course) { console.error('Course not found'); process.exit(1) }

  const sprints = readdirSync(CONTENT_DIR).filter(d => d.startsWith('sprint-'))

  for (const sprint of sprints.sort()) {
    const sprintDir = join(CONTENT_DIR, sprint)
    const files = readdirSync(sprintDir).filter(f => f.endsWith('.mdx'))

    for (const file of files.sort()) {
      const relativePath = `${sprint}/${file}`
      const parsed = parseFilePath(relativePath)
      if (!parsed) continue

      const content = readFileSync(join(sprintDir, file), 'utf-8')

      const { data: module } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', course.id)
        .eq('order', parsed.moduleOrder)
        .single()

      if (!module) { console.error(`Module ${parsed.moduleOrder} not found`); continue }

      const { error } = await supabase
        .from('lessons')
        .update({ content_mdx: content })
        .eq('module_id', module.id)
        .eq('order', parsed.lessonOrder)

      if (error) {
        console.error(`Error uploading ${relativePath}:`, error)
      } else {
        console.log(`✅ Uploaded: ${relativePath}`)
      }
    }
  }

  console.log('\n🎉 Upload completo!')
}

upload()
```

- [ ] **Step 2: Crear estructura de directorios**

```bash
mkdir -p content/cursos/sprint-{1,2,3,4,5}
```

- [ ] **Step 3: Commit**

```bash
git add scripts/upload-lesson-content.ts content/cursos/
git commit -m "feat(cursos): add lesson content upload script and content directory"
```

---

## Task 4: Contenido MDX — Sprint 1 (Sesiones 1-3)

**Archivos:**
- Crear: `content/cursos/sprint-1/sesion-1.mdx`
- Crear: `content/cursos/sprint-1/sesion-2.mdx`
- Crear: `content/cursos/sprint-1/sesion-3.mdx`

> Cada guía sigue la misma estructura: resumen de la sesión, conceptos clave, comandos/pasos exactos, ejercicio entre sesiones, y ruta acelerada opcional.

- [ ] **Step 1: Escribir `content/cursos/sprint-1/sesion-1.mdx`**

```mdx
# Sesión 1 — El mapa de la IA

## Resumen

Hoy mapeas el paisaje completo de la inteligencia artificial. Al final de esta sesión entiendes qué son los modelos, cómo funcionan, y cómo elegir la herramienta correcta para cada tarea.

---

## Conceptos clave

### ¿Qué es un LLM?

Un **Large Language Model** es un sistema entrenado con enormes cantidades de texto para predecir qué palabra viene después. No "piensa" — calcula probabilidades. Pero lo hace tan bien que el resultado se parece a razonar.

- **Token:** la unidad mínima de texto que procesa el modelo. Aproximadamente 1 token = 0.75 palabras en español.
- **Contexto:** todo el texto que el modelo puede "ver" en una conversación. Tiene un límite (la "ventana de contexto").
- **Temperatura:** qué tan predecible o creativo es el modelo. 0 = respuestas consistentes, 1 = más variación.
- **Alucinación:** cuando el modelo inventa hechos con total confianza. No miente — no puede saber que se equivoca.

### El paisaje de modelos

| Modelo | Empresa | Mejor para |
|---|---|---|
| Claude (Sonnet, Opus) | Anthropic | Razonamiento largo, código, análisis |
| GPT-4o | OpenAI | Uso general, multimodal |
| Gemini | Google | Integración con Google Workspace |
| Llama | Meta | Correr localmente, proyectos open source |

### Herramientas vs. modelos vs. plataformas

- **Modelo:** el cerebro (ej: Claude Sonnet 4.6)
- **Plataforma:** la interfaz para usarlo (ej: claude.ai)
- **API:** la forma de llamar al modelo desde código (ej: API de Anthropic)
- **Herramienta con IA:** un producto construido sobre la API (ej: Cursor, GitHub Copilot)

---

## Cuentas a crear hoy

1. **Claude:** [claude.ai](https://claude.ai) — plan gratuito disponible
2. **ChatGPT:** [chatgpt.com](https://chatgpt.com) — plan gratuito disponible
3. **GitHub:** [github.com](https://github.com) — siempre gratuito
4. **Vercel:** [vercel.com](https://vercel.com) — plan gratuito suficiente para el curso

---

## Ejercicio de la sesión

Escribe tu bio profesional con IA. Usa este prompt en Claude:

> "Soy [nombre], [cargo/rol] en [empresa/proyecto]. Mi experiencia incluye [áreas de experiencia]. Escribe una bio profesional de 3 oraciones para la sección 'sobre mí' de mi página web personal. Tono: [formal/casual/técnico]. No uses frases clichés como 'apasionado por' o 'orientado a resultados'."

Luego corre el mismo prompt en ChatGPT y compara las respuestas. ¿Qué diferencias notan?

---

## Tarea entre sesiones

Escribe en un documento (puede ser en papel) **3 situaciones de tu trabajo actual** donde creas que la IA podría ayudarte. Para cada una:
- Describe el problema o tarea
- Qué tipo de output esperarías de la IA
- Por qué actualmente no lo haces con IA

Esto lo compartiremos al inicio de la Sesión 2.

---

## Recursos

- [Anthropic — cómo funcionan los LLMs](https://www.anthropic.com/research) (inglés)
- [Tokenizer de OpenAI](https://platform.openai.com/tokenizer) — visualiza cómo se tokeniza texto
- [LMSYS Chatbot Arena](https://lmarena.ai) — compara modelos en tiempo real con tus propios prompts
```

- [ ] **Step 2: Escribir `content/cursos/sprint-1/sesion-2.mdx`**

```mdx
# Sesión 2 — Prompting que funciona

## Resumen

La diferencia entre un resultado mediocre y uno excelente casi siempre está en el prompt. Hoy aprendes a construir prompts que funcionan, a iterar cuando el resultado no es el esperado, y a entender cuándo la IA no es la herramienta correcta.

---

## La anatomía de un buen prompt

Un prompt efectivo tiene 5 componentes. No todos son necesarios siempre, pero conocerlos te permite construir mejores instrucciones:

```
[ROL] Eres un copywriter experto en tecnología B2B.

[CONTEXTO] Estoy construyendo mi página personal para mostrar mis proyectos de ingeniería de datos.
Mi audiencia son recruiters técnicos y CTOs de startups colombianas.

[TAREA] Escribe la sección "Sobre mí" de mi página.

[FORMATO] Máximo 3 párrafos. El primero describe quién soy, el segundo mis áreas de expertise,
el tercero lo que busco profesionalmente. Sin listas. Sin bullets.

[RESTRICCIONES] No uses las palabras "apasionado", "proactivo", ni "orientado a resultados".
Evita frases en inglés. Tono profesional pero cercano.
```

---

## Prompting iterativo

No esperes el prompt perfecto a la primera. El proceso es:

1. **Primer intento:** describe lo que necesitas en lenguaje natural
2. **Evalúa:** ¿qué está bien? ¿qué falta o sobra?
3. **Refina:** corrige solo lo que está mal, no empieces de cero
4. **Repite:** 2-3 iteraciones suelen ser suficientes

### Ejemplo de refinamiento

**Prompt 1:** "Escribe la descripción de mi proyecto de análisis de datos"

**Problema:** muy vago, el modelo no sabe qué proyecto, para quién, ni en qué formato.

**Prompt 2:** "Escribe una descripción de 2 oraciones de mi proyecto CortexAI para el portafolio de mi página personal. El proyecto es un sistema de búsqueda semántica sobre el data warehouse de mi empresa usando Snowflake Cortex. Audiencia: recruiters técnicos."

**Mucho mejor.** Si el resultado sigue sin convencerte, continúa en la misma conversación:

> "Está bien pero suena muy técnico. Hazlo más accesible para alguien que no conoce Snowflake."

---

## Cuándo la IA falla (y por qué)

- **Información reciente:** su entrenamiento tiene fecha de corte. No sabe qué pasó la semana pasada.
- **Datos privados:** no conoce el data warehouse de tu empresa, tu código interno, ni tus documentos.
- **Matemáticas precisas:** puede equivocarse en cálculos. Verifica siempre.
- **Referencias externas:** puede inventar links, papers o libros que no existen.

**Regla práctica:** si el resultado es importante y verificable, verifícalo.

---

## Instalación del editor

### Opción A: VS Code (recomendado para empezar)

1. Descargar VS Code: [code.visualstudio.com](https://code.visualstudio.com)
2. Instalar extensión **GitHub Copilot** (gratuita con cuenta GitHub)
3. Instalar extensión **Prettier** para formateo automático

### Opción B: Cursor (recomendado para ruta acelerada)

1. Descargar Cursor: [cursor.com](https://cursor.com)
2. Cursor incluye IA integrada (GPT-4o / Claude) sin extensiones adicionales
3. Funciona como VS Code — los atajos son los mismos

---

## Ejercicio de la sesión

Construye el contenido de tu página personal usando IA. Necesitas texto para:

1. **Sección "sobre mí"** — 2-3 párrafos
2. **1-2 proyectos** — título + descripción de 2 oraciones cada uno
3. **Frase de contacto** — una oración invitando a conectar

Usa el framework de 5 componentes para cada prompt. Itera al menos 2 veces por sección.

---

## Tarea entre sesiones

Al terminar la sesión, tienes el contenido de tu página listo en un documento. En la próxima sesión lo usarás directamente para personalizar tu template. No necesitas escribir código — solo tener el texto.

**Ruta acelerada:** Instala Cursor y explora el modo "Composer" (Cmd+I). Describe en lenguaje natural un cambio que quisieras hacer en un archivo de texto y observa cómo Cursor lo propone.

---

## Recursos

- [Guía de prompting de Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- [Prompts de ejemplo por caso de uso](https://docs.anthropic.com/en/prompt-library/library)
```

- [ ] **Step 3: Escribir `content/cursos/sprint-1/sesion-3.mdx`**

```mdx
# Sesión 3 — Primer Deploy

## Resumen

Hoy tu página personal queda en línea. Al terminar esta sesión tienes una URL pública que puedes compartir. No es perfecta todavía — pero es tuya y es real.

---

## Conceptos clave

### ¿Qué es un repositorio?

Un **repositorio** (repo) es una carpeta con tu código que GitHub gestiona y versiona. Piénsalo como un Google Drive para código, pero con historial completo de cada cambio.

- **Fork:** crear tu propia copia de un repositorio existente. Tus cambios no afectan el original.
- **Clone:** descargar el repositorio a tu computadora para trabajar localmente.

### ¿Qué es un deploy?

**Deploy** es el proceso de llevar tu código de tu computadora al servidor donde vive para que el mundo lo vea.

Vercel hace esto automáticamente: cada vez que haces push a GitHub, Vercel detecta el cambio, reconstruye el sitio y lo publica. Todo en menos de 60 segundos.

---

## Pasos del primer deploy

### 1. Fork del template

1. Ir a [github.com/sergiomonsalve/ia-cero-produccion-template](https://github.com/sergiomonsalve/ia-cero-produccion-template)
2. Click en **Fork** (arriba a la derecha)
3. Nombrar el repositorio: `tu-nombre.com` o `mi-sitio-personal` (puedes cambiarlo después)
4. Click en **Create fork**

Ahora tienes una copia del template en tu cuenta de GitHub.

### 2. Personalizar el contenido con IA

Antes de conectar a Vercel, personaliza el texto de tu página. En GitHub, puedes editar directamente:

1. Abrir `app/page.tsx` en tu fork
2. Click en el ícono de lápiz (Edit)
3. Pegar el contenido de tu bio y proyectos (lo preparaste en la Sesión 2)
4. Click en **Commit changes**

**O usa este prompt en Claude:**

> "Tengo este archivo page.tsx: [pega el contenido del archivo]. Mi nombre es [nombre], soy [rol] y trabajo en [proyecto/empresa]. Mis proyectos son: [lista de proyectos]. Reescribe los placeholders con mi información real. Mantén exactamente la misma estructura JSX — solo cambia los textos entre corchetes."

Copia el código generado, pégalo en el editor de GitHub y haz commit.

### 3. Conectar a Vercel

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Hacer login con tu cuenta de GitHub
3. Click en **Import** junto a tu repositorio
4. Dejar todas las opciones por defecto — Vercel detecta Next.js automáticamente
5. Click en **Deploy**

Vercel muestra el progreso del build en tiempo real. En ~60 segundos aparece tu URL.

### 4. Tu URL

Vercel asigna una URL del tipo `tu-proyecto.vercel.app`. En el Sprint 4 conectaremos tu dominio personalizado.

---

## Ejercicio de la sesión

Compartir la URL con el grupo en el canal del curso. Visitar el sitio de los demás y dejar un comentario sobre algo que les llame la atención.

---

## Tarea entre sesiones

**Ruta estándar:** El sitio está en línea. Compártelo con alguien de tu círculo cercano y observa su reacción. ¿Qué preguntan? ¿Qué cambiarías?

**Ruta acelerada:** Explorar los archivos de tu repositorio en GitHub. Abrir `app/layout.tsx`, `app/globals.css`. Usar Claude para que te explique qué hace cada archivo: "Explícame qué hace este archivo como si fuera mi primera semana programando en Next.js." Anotar 3 cosas que no entienden aún — las veremos en la Sesión 4.

---

## Recursos

- [Documentación de Vercel para Next.js](https://vercel.com/docs/frameworks/nextjs)
- [GitHub Docs — Forks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks)
```

- [ ] **Step 4: Subir contenido de Sprint 1 a Supabase**

```bash
npx tsx scripts/upload-lesson-content.ts
```

Resultado esperado:
```
✅ Uploaded: sprint-1/sesion-1.mdx
✅ Uploaded: sprint-1/sesion-2.mdx
✅ Uploaded: sprint-1/sesion-3.mdx
🎉 Upload completo!
```

- [ ] **Step 5: Verificar en el sitio que el contenido carga**

```bash
npm run dev
```

Navegar a `http://localhost:3000/es/cursos`. Hacer enrollment en el curso. Navegar a la primera lección y verificar que el contenido MDX se renderiza correctamente.

- [ ] **Step 6: Commit**

```bash
git add content/cursos/sprint-1/
git commit -m "content(cursos): add Sprint 1 session guides (sessions 1-3)"
```

---

## Tasks 5-8: Contenido MDX — Sprints 2 al 5 (rolling)

> Estos tasks se ejecutan **una semana antes de cada sprint**, no todos de una vez. El patrón es idéntico al Task 4.

**Task 5 — Sprint 2 (Sesiones 4-6):** Git, leer código con IA, diseño con Tailwind
**Task 6 — Sprint 3 (Sesiones 7-9):** Supabase setup, API Routes, formulario de contacto
**Task 7 — Sprint 4 (Sesiones 10-12):** CI/CD con Vercel, dominio + DNS, Supabase Auth, SEO
**Task 8 — Sprint 5 (Sesiones 13-15):** Vercel AI SDK, chatbot con useChat, embeddings + pgvector

Para cada task:
1. Escribir los 3 archivos MDX en `content/cursos/sprint-N/`
2. Ejecutar `npx tsx scripts/upload-lesson-content.ts`
3. Verificar en el sitio
4. Commit con mensaje `content(cursos): add Sprint N session guides (sessions X-Y)`

---

## Checklist final antes del Sprint 1

- [ ] Script de seed ejecutado — curso con 5 módulos y 15 lecciones en Supabase
- [ ] Repositorio template `ia-cero-produccion-template` público en GitHub con deploy badge
- [ ] Contenido MDX de Sprint 1 (sesiones 1-3) cargado y visible en el sitio
- [ ] URL del repositorio template lista para compartir con el grupo en la Sesión 3
- [ ] Curso visible en `sergiomonsalve.com/es/cursos`
