import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { readingTime } from '@/lib/reading-time'

const contentRoot = path.join(process.cwd(), 'content/blog')

export type PostMeta = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readingTime: string
}

export type Post = PostMeta & { content: string }

export function getAllPosts(locale: string): PostMeta[] {
  const dir = path.join(contentRoot, locale)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(filename => {
      const slug = filename.replace('.mdx', '')
      const { data, content } = matter(fs.readFileSync(path.join(dir, filename), 'utf-8'))
      return {
        slug,
        title: data.title as string,
        date: String(data.date),
        description: data.description as string,
        tags: (data.tags as string[]) ?? [],
        readingTime: readingTime(content),
      }
    })
    .filter(p => p.title)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPost(slug: string, locale: string): Post | null {
  const filePath = path.join(contentRoot, locale, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'))
  return {
    slug,
    title: data.title as string,
    date: String(data.date),
    description: data.description as string,
    tags: (data.tags as string[]) ?? [],
    readingTime: readingTime(content),
    content,
  }
}

export function getPostSlugs(locale: string): string[] {
  const dir = path.join(contentRoot, locale)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.mdx')).map(f => f.replace('.mdx', ''))
}
