import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAllRecipes } from '@/lib/recipes'
import RecipeList from '@/components/RecipeList'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('recipesTitle'),
    description: t('recipesDescription'),
    alternates: { canonical: `/${locale}/recipes` }
  }
}

export default async function RecipesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const recipes = getAllRecipes(locale)
  const t = await getTranslations({ locale, namespace: 'recipes' })

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-accent mb-2">{t('comment')}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-10">{t('title')}</h1>
      <RecipeList recipes={recipes} locale={locale} />
    </div>
  )
}
