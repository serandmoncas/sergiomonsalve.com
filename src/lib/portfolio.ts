import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentRoot = path.join(process.cwd(), 'content/portfolio')

export type ProjectMeta = {
  slug: string
  title: string
  description: string
  date: string
  role: string
  stack: string[]
  github: string
  demo: string
  status: 'active' | 'archived'
  featured: boolean
  image: string
}

export type Project = ProjectMeta & { content: string }

export function getAllProjects(locale: string): ProjectMeta[] {
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
        description: data.description as string,
        date: String(data.date),
        role: data.role as string,
        stack: (data.stack as string[]) ?? [],
        github: (data.github as string) ?? '',
        demo: (data.demo as string) ?? '',
        status: (data.status as 'active' | 'archived') ?? 'active',
        featured: (data.featured as boolean) ?? false,
        image: (data.image as string) ?? '',
      }
    })
    .filter(p => p.title)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getProject(slug: string, locale: string): Project | null {
  const filePath = path.join(contentRoot, locale, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'))
  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: String(data.date),
    role: data.role as string,
    stack: (data.stack as string[]) ?? [],
    github: (data.github as string) ?? '',
    demo: (data.demo as string) ?? '',
    status: (data.status as 'active' | 'archived') ?? 'active',
    featured: (data.featured as boolean) ?? false,
    image: (data.image as string) ?? '',
    content,
  }
}

export function getProjectSlugs(locale: string): string[] {
  const dir = path.join(contentRoot, locale)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.mdx')).map(f => f.replace('.mdx', ''))
}
