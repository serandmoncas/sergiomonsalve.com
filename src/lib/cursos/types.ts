// src/lib/cursos/types.ts

export interface CourseListItem {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string | null
  is_free: boolean
  module_count: number
  lesson_count: number
  coming_soon?: boolean
}

export interface LessonPublic {
  id: string
  title: string
  description: string | null
  duration_minutes: number | null
  order: number
  template_ref: string | null
}

export interface ModulePublic {
  id: string
  title: string
  description: string | null
  order: number
  lessons: LessonPublic[]
}

export interface CourseDetail {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string | null
  is_free: boolean
  modules: ModulePublic[]
}

export interface Enrollment {
  id: string
  course_id: string
  course_slug: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  approved_at: string | null
  expires_at: string | null
  is_active: boolean
}

export interface LessonProgress {
  lesson_id: string
  completed: boolean
  completed_at: string | null
}

export interface LessonContent {
  content_mdx: string | null
  youtube_video_id: string | null
  template_ref: string | null
}
