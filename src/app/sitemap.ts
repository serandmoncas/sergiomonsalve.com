import type { MetadataRoute } from 'next'
import { getPostSlugs } from '@/lib/posts'
import { getRecipeSlugs } from '@/lib/recipes'
import { getBookAsins } from '@/lib/library'

const base = 'https://sergiomonsalve.com'
const locales = ['es', 'en']
const staticRoutes = ['', '/about', '/contact', '/blog', '/recipes', '/biblioteca']

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = locales.flatMap(locale =>
    staticRoutes.map(route => ({
      url: `${base}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8
    }))
  )

  const postEntries = locales.flatMap(locale =>
    getPostSlugs(locale).map(slug => ({
      url: `${base}/${locale}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6
    }))
  )

  const recipeEntries = locales.flatMap(locale =>
    getRecipeSlugs(locale).map(slug => ({
      url: `${base}/${locale}/recipes/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6
    }))
  )

  const bookEntries = locales.flatMap(locale =>
    getBookAsins().map(asin => ({
      url: `${base}/${locale}/biblioteca/${asin}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6
    }))
  )

  return [...staticEntries, ...postEntries, ...recipeEntries, ...bookEntries]
}
