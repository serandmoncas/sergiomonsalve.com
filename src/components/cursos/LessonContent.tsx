import MDXContent from '@/components/MDXContent'
import MarkCompleteButton from './MarkCompleteButton'
import type { LessonPublic } from '@/lib/cursos/types'

interface Props {
  lesson: LessonPublic & { content_mdx: string | null; youtube_video_id: string | null }
  courseSlug: string
  isCompleted: boolean
}

export default function LessonContent({ lesson, courseSlug, isCompleted }: Props) {
  return (
    <div className="flex-1 min-w-0">
      <h1 className="text-2xl font-extrabold text-text mb-6">{lesson.title}</h1>

      {lesson.youtube_video_id && (
        <div className="relative aspect-video mb-8 rounded-sm overflow-hidden bg-surface">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtube_video_id}`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      )}

      {lesson.content_mdx && (
        <div className="mb-8">
          <MDXContent source={lesson.content_mdx} />
        </div>
      )}

      {lesson.template_ref && (
        <p className="font-mono text-xs text-text-muted mb-8">
          template:{' '}
          <a
            href={`https://github.com/serandmoncas/PersonalPage/tree/${lesson.template_ref}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {lesson.template_ref}
          </a>
        </p>
      )}

      <div className="pt-6 border-t border-border">
        <MarkCompleteButton
          courseSlug={courseSlug}
          lessonId={lesson.id}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  )
}
