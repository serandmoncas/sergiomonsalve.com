// Run: npx tsx scripts/seed-curso-ia.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envVars = Object.fromEntries(
  readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const idx = l.indexOf('='); return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')] })
)
Object.assign(process.env, envVars)

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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🌱 Seeding curso:', COURSE_SLUG)

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
      .insert({ ...modData, course_id: course.id })
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
        .insert({ ...lesson, module_id: module.id })

      if (lessonError) {
        console.error('Error creating lesson:', lesson.title, lessonError)
        process.exit(1)
      }

      console.log(`    ✅ Lesson ${lesson.order}: ${lesson.title}`)
    }
  }

  console.log('\n🎉 Seed completo!')
}

seed().catch(console.error)
