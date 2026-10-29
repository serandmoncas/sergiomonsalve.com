import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { readingTime } from '@/lib/reading-time'

const contentRoot = path.join(process.cwd(), 'content/bio')

export type Bio = {
  title: string
  description: string
  readingTime: string
  content: string
}

// Una sola biografía por idioma: content/bio/[locale].mdx
export function getBio(locale: string): Bio | null {
  const filePath = path.join(contentRoot, `${locale}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'))
  return {
    title: data.title as string,
    description: data.description as string,
    readingTime: readingTime(content),
    content,
  }
}
