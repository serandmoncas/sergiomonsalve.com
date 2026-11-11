'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import RecipeCard from './RecipeCard'
import type { RecipeMeta } from '@/lib/recipes'

export default function RecipeList({ recipes, locale }: { recipes: RecipeMeta[]; locale: string }) {
  const t = useTranslations('recipes')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(recipes.flatMap(r => r.tags))).sort()
  const filtered = activeTag ? recipes.filter(r => r.tags.includes(activeTag)) : recipes

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
              !activeTag
                ? 'bg-accent text-background border-accent font-bold'
                : 'border-border text-text-secondary hover:border-accent hover:text-accent'
            }`}
          >
            {t('allTags')}
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
                activeTag === tag
                  ? 'bg-accent text-background border-accent font-bold'
                  : 'border-border text-text-secondary hover:border-accent hover:text-accent'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">{'//'} {t('empty')}</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.slug} recipe={recipe} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
