// Run: npx tsx scripts/seed-cursos.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually (ESM hoisting prevents dotenv from running before createClient)
const envPath = resolve(process.cwd(), '.env.local')
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
Object.assign(process.env, envVars)

async function seed() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('Seeding Personal Page Recipe course...')

  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .upsert([{
      title: 'Personal Page Recipe',
      slug: 'personal-page-recipe',
      description: 'Aprende a construir tu sitio web personal con Next.js, Supabase y Claude Code. Desde cero hasta producción en 6 módulos.',
      is_published: true,
      is_free: true,
    }], { onConflict: 'slug' })
    .select()

  if (courseErr) { console.error(courseErr); process.exit(1) }
  const courseId = course![0].id
  console.log('Course:', courseId)

  const modulesDef = [
    { title: 'Setup & Herramientas', description: 'Claude Code, Git, Node.js y VS Code listos para trabajar.', order: 1,
      lessons: [
        { title: 'Instalar Node.js y Git', order: 1, duration_minutes: 10 },
        { title: 'Configurar VS Code con Claude Code', order: 2, duration_minutes: 15 },
        { title: 'Tu primer prompt en Claude Code', order: 3, duration_minutes: 10 },
      ]
    },
    { title: 'El Template Base', description: 'Clonar y entender la estructura del repo PersonalPage.', order: 2,
      lessons: [
        { title: 'Clonar el repositorio PersonalPage', order: 1, duration_minutes: 5 },
        { title: 'Estructura de Next.js App Router', order: 2, duration_minutes: 15 },
        { title: 'Variables de entorno y Supabase', order: 3, duration_minutes: 10 },
      ]
    },
    { title: 'IA en tu Workflow', description: 'Usar Claude Code en la práctica para construir features reales.', order: 3,
      lessons: [
        { title: 'Cómo darle contexto efectivo a Claude', order: 1, duration_minutes: 12 },
        { title: 'Construir un componente con IA', order: 2, duration_minutes: 20 },
        { title: 'Revisar y refinar el código generado', order: 3, duration_minutes: 10 },
      ]
    },
    { title: 'Personalización', description: 'Diseño, contenido y blog MDX con tu propia voz.', order: 4,
      lessons: [
        { title: 'Cambiar colores y tipografía', order: 1, duration_minutes: 15 },
        { title: 'Agregar tu primer blog post en MDX', order: 2, duration_minutes: 20 },
        { title: 'Sección portfolio y proyectos', order: 3, duration_minutes: 15 },
      ]
    },
    { title: 'Deploy & CI/CD', description: 'Vercel, GitHub Actions y dominio propio en producción.', order: 5,
      lessons: [
        { title: 'Deploy a Vercel desde GitHub', order: 1, duration_minutes: 10 },
        { title: 'Configurar dominio propio', order: 2, duration_minutes: 10 },
        { title: 'CI/CD automático con GitHub Actions', order: 3, duration_minutes: 15 },
      ]
    },
    { title: 'Variantes de Stack', description: 'Elegir entre FastAPI, Supabase y Astro según tu caso de uso.', order: 6,
      lessons: [
        { title: 'Cuándo usar Supabase vs FastAPI', order: 1, duration_minutes: 10 },
        { title: 'Migrar a Astro para sitios estáticos', order: 2, duration_minutes: 15 },
        { title: 'Próximos pasos y recursos', order: 3, duration_minutes: 8 },
      ]
    },
  ]

  for (const modDef of modulesDef) {
    const { data: mod, error: modErr } = await supabase
      .from('modules')
      .insert([{
        course_id: courseId,
        title: modDef.title,
        description: modDef.description,
        order: modDef.order,
        is_published: true,
      }])
      .select()

    if (modErr) { console.error(modErr); process.exit(1) }
    const moduleId = mod![0].id
    console.log('  Module:', modDef.title)

    for (const lessonDef of modDef.lessons) {
      await supabase.from('lessons').insert([{
        module_id: moduleId,
        title: lessonDef.title,
        order: lessonDef.order,
        duration_minutes: lessonDef.duration_minutes,
        is_published: true,
        content_mdx: `# ${lessonDef.title}\n\nContenido pendiente de agregar.`,
      }])
      console.log('    Lesson:', lessonDef.title)
    }
  }

  console.log('Done!')
}

seed().catch(console.error)
