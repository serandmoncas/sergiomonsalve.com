import { describe, it, expect, vi } from 'vitest'

vi.mock('next-mdx-remote/rsc', () => ({ MDXRemote: () => null }))
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'es' }))

import { components } from '../MDXContent'

describe('MDXContent', () => {
  it('registra los componentes del autorretrato', () => {
    for (const nombre of ['CalendarioActividad', 'BarrasHerramientas', 'CoautoriaMensual', 'MatrizEcosistema', 'CuadranteConceptos', 'PerfilPrompts', 'RedCoautoria', 'MapaDiscurso', 'CaminoMotion']) {
      expect(components).toHaveProperty(nombre)
    }
    expect(components).toHaveProperty('Step')
  })
})
