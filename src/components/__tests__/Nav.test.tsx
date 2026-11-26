import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
}))
vi.mock('@/i18n/navigation', () => ({ Link: () => null }))
vi.mock('../LocaleSwitcher', () => ({ default: () => null }))
vi.mock('../UserMenu', () => ({ default: () => null }))
vi.mock('../MenuMovil', () => ({ default: () => null }))

import Nav from '../Nav'

// Recorre el árbol de elementos de React y junta cada prop `href`.
function juntarHrefs(nodo: ReactNode, acc: string[] = []): string[] {
  if (Array.isArray(nodo)) nodo.forEach((n) => juntarHrefs(n, acc))
  else if (nodo && typeof nodo === 'object' && 'props' in nodo) {
    const props = (nodo as { props: Record<string, unknown> }).props
    if (typeof props.href === 'string') acc.push(props.href)
    if (Array.isArray(props.grupos)) {
      for (const g of props.grupos as { items: { href: string }[] }[]) {
        g.items.forEach((i) => acc.push(i.href))
      }
    }
    juntarHrefs(props.children as ReactNode, acc)
  }
  return acc
}

describe('Nav', () => {
  it('enlaza el manual de usuario en el menú de computador y en el del celular', async () => {
    const hrefs = juntarHrefs(await Nav())
    // Una vez en la fila de escritorio y otra en los grupos del menú móvil
    expect(hrefs.filter((h) => h === '/manual-de-usuario')).toHaveLength(2)
  })
})
