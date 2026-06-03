import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { CourseListItem } from '@/lib/cursos/types'

export default function CourseCard({ course, locale }: { course: CourseListItem; locale: string }) {
  return (
    <Link
      href={`/cursos/${course.slug}`}
      locale={locale}
      className="block border border-border bg-surface rounded-sm hover:border-accent transition-colors overflow-hidden"
    >
      {course.thumbnail_url && (
        <div className="relative aspect-video">
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-mono text-sm font-bold text-text flex-1">{course.title}</h2>
          {course.is_free && (
            <span className="font-mono text-xs text-accent border border-accent px-2 py-0.5 rounded-sm shrink-0">
              Gratis
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary leading-relaxed mb-4">{course.description}</p>
        <p className="font-mono text-xs text-text-muted">
          {course.module_count} módulos · {course.lesson_count} lecciones
        </p>
      </div>
    </Link>
  )
}
