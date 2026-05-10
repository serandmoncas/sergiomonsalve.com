import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentRoot = path.join(process.cwd(), 'content/recipes')

export type RecipeMeta = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  servings: number
  time: string
  ingredients: string[]
}

export type Recipe = RecipeMeta & { content: string }

export function getAllRecipes(locale: string): RecipeMeta[] {
  const dir = path.join(contentRoot, locale)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(filename => {
      const slug = filename.replace('.mdx', '')
      const { data } = matter(fs.readFileSync(path.join(dir, filename), 'utf-8'))
      return {
        slug,
        title: data.title as string,
        date: String(data.date),
        description: data.description as string,
        tags: (data.tags as string[]) ?? [],
        servings: (data.servings as number) ?? 2,
        time: (data.time as string) ?? '',
        ingredients: (data.ingredients as string[]) ?? []
      }
    })
    .filter(r => r.title)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getRecipe(slug: string, locale: string): Recipe | null {
  const filePath = path.join(contentRoot, locale, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'))
  return {
    slug,
    title: data.title as string,
    date: String(data.date),
    description: data.description as string,
    tags: (data.tags as string[]) ?? [],
    servings: (data.servings as number) ?? 2,
    time: (data.time as string) ?? '',
    ingredients: (data.ingredients as string[]) ?? [],
    content
  }
}

export function getRecipeSlugs(locale: string): string[] {
  const dir = path.join(contentRoot, locale)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.mdx')).map(f => f.replace('.mdx', ''))
}
