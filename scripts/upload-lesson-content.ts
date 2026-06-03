// scripts/upload-lesson-content.ts — npx tsx scripts/upload-lesson-content.ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const envVars = Object.fromEntries(
  readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const idx = l.indexOf('='); return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')] })
)
Object.assign(process.env, envVars)

const COURSE_SLUG = 'ia-de-cero-a-produccion'
const CONTENT_DIR = join(process.cwd(), 'content/cursos')

function parseFilePath(relativePath: string): { moduleOrder: number; lessonOrder: number } | null {
  const match = relativePath.match(/sprint-(\d+)\/sesion-(\d+)\.mdx/)
  if (!match) return null
  const moduleOrder = parseInt(match[1])
  const absoluteSession = parseInt(match[2])
  // Files use cumulative numbering (1-3 sprint1, 4-6 sprint2, etc.)
  // Convert to relative (1-3) within each module
  const lessonOrder = ((absoluteSession - 1) % 3) + 1
  return { moduleOrder, lessonOrder }
}

async function upload() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', COURSE_SLUG)
    .single()

  if (!course) {
    console.error(`Course '${COURSE_SLUG}' not found. Run seed-curso-ia.ts first.`)
    process.exit(1)
  }

  const sprints = readdirSync(CONTENT_DIR)
    .filter(d => d.startsWith('sprint-') && existsSync(join(CONTENT_DIR, d)))
    .sort()

  let uploaded = 0
  let skipped = 0

  for (const sprint of sprints) {
    const sprintDir = join(CONTENT_DIR, sprint)
    const files = readdirSync(sprintDir).filter(f => f.endsWith('.mdx')).sort()

    for (const file of files) {
      const relativePath = `${sprint}/${file}`
      const parsed = parseFilePath(relativePath)
      if (!parsed) { skipped++; continue }

      const content = readFileSync(join(sprintDir, file), 'utf-8')

      const { data: module } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', course.id)
        .eq('"order"', parsed.moduleOrder)
        .single()

      if (!module) {
        console.warn(`  ⚠️  Module ${parsed.moduleOrder} not found, skipping ${relativePath}`)
        skipped++
        continue
      }

      const { error } = await supabase
        .from('lessons')
        .update({ content_mdx: content })
        .eq('module_id', module.id)
        .eq('"order"', parsed.lessonOrder)

      if (error) {
        console.error(`  ❌ Error uploading ${relativePath}:`, error.message)
      } else {
        console.log(`  ✅ ${relativePath}`)
        uploaded++
      }
    }
  }

  console.log(`\n🎉 Done: ${uploaded} uploaded, ${skipped} skipped`)
}

upload().catch(console.error)
