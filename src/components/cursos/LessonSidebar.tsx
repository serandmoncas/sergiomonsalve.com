'use client'

import { useRouter } from '@/i18n/navigation'
import type { ModulePublic } from '@/lib/cursos/types'

export default function LessonSidebar({
  modules,
  activeLessonId,
  completedLessonIds,
  courseSlug,
}: {
  modules: ModulePublic[]
  activeLessonId: string
  completedLessonIds: string[]
  courseSlug: string
}) {
  const router = useRouter()
  const completedSet = new Set(completedLessonIds)

  return (
    <nav className="w-64 shrink-0 border-r border-border pr-6">
      {modules
        .sort((a, b) => a.order - b.order)
        .map(mod => (
          <div key={mod.id} className="mb-6">
            <p className="font-mono text-xs text-accent mb-2">{mod.title}</p>
            <ul className="space-y-1">
              {mod.lessons
                .sort((a, b) => a.order - b.order)
                .map(lesson => {
                  const isActive = lesson.id === activeLessonId
                  const isDone = completedSet.has(lesson.id)
                  return (
                    <li key={lesson.id}>
                      <button
                        data-active={isActive}
                        onClick={() => router.push(`/cursos/${courseSlug}/aprender?leccion=${lesson.id}`)}
                        className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-sm transition-colors text-xs font-mono ${
                          isActive
                            ? 'text-text bg-surface'
                            : 'text-text-muted hover:text-text hover:bg-surface'
                        }`}
                      >
                        {isDone ? (
                          <span data-testid={`check-${lesson.id}`} className="text-accent shrink-0">✓</span>
                        ) : (
                          <span className="w-4 shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    </li>
                  )
                })}
            </ul>
          </div>
        ))}
    </nav>
  )
}
