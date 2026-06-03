import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LessonSidebar from '../LessonSidebar'
import type { ModulePublic } from '@/lib/cursos/types'

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/es/cursos/personal-page-recipe/aprender'
}))

const modules: ModulePublic[] = [
  {
    id: 'mod-1', title: 'Setup', description: null, order: 1,
    lessons: [
      { id: 'les-1', title: 'Instalar Node', description: null, duration_minutes: 5, order: 1, template_ref: null },
      { id: 'les-2', title: 'Configurar VS Code', description: null, duration_minutes: 10, order: 2, template_ref: null },
    ]
  }
]

describe('LessonSidebar', () => {
  it('renders module and lesson titles', () => {
    render(
      <LessonSidebar
        modules={modules}
        activeLessonId="les-1"
        completedLessonIds={[]}
        courseSlug="personal-page-recipe"
      />
    )
    expect(screen.getByText('Setup')).toBeDefined()
    expect(screen.getByText('Instalar Node')).toBeDefined()
    expect(screen.getByText('Configurar VS Code')).toBeDefined()
  })

  it('shows checkmark only for completed lessons', () => {
    render(
      <LessonSidebar
        modules={modules}
        activeLessonId="les-1"
        completedLessonIds={['les-2']}
        courseSlug="personal-page-recipe"
      />
    )
    expect(screen.getByTestId('check-les-2')).toBeDefined()
    expect(screen.queryByTestId('check-les-1')).toBeNull()
  })

  it('highlights the active lesson', () => {
    const { container } = render(
      <LessonSidebar
        modules={modules}
        activeLessonId="les-1"
        completedLessonIds={[]}
        courseSlug="personal-page-recipe"
      />
    )
    const activeItem = container.querySelector('[data-active="true"]')
    expect(activeItem).not.toBeNull()
  })
})
