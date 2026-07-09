export interface BaseContentEntity {
  id: number | null
  slug: string
  title: string
  summary?: string | null
  order: number
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  [key: string]: unknown
}

export interface Course extends BaseContentEntity {
  cover?: string | null
  edition?: string | null
  body?: string | null
  chapters?: Chapter[]
}

export interface Chapter extends BaseContentEntity {
  course?: string | null
  courseId?: number | null
  cover?: string | null
  body?: string | null
  lessons?: Lesson[]
  exercises?: Exercise[]
}

export interface Lesson extends BaseContentEntity {
  chapter?: string | null
  chapterId?: number | null
  objectives?: string | null
  intro?: string | null
  body?: string | null
  summaryText?: string | null
  notes?: string | null
}

export interface Exercise extends BaseContentEntity {
  description?: string | null
  body?: string | null
  chapter?: string | null
  chapterId?: number | null
  hint?: string | null
  answer?: string | null
  analysis?: string | null
}

export interface Asset {
  id: number | null
  slug: string
  title: string
  summary?: string | null
  type: string
  url: string
  mime?: string | null
  size?: number | null
  meta?: string | null
  order?: number
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  [key: string]: unknown
}

export interface ChapterListOptions {
  course?: string | null
  courseSlug?: string | null
  limit?: number
  offset?: number
  orderBy?: 'id' | 'order' | string
  order?: 'asc' | 'desc'
  [key: string]: unknown
}

export interface QueryOptions {
  [key: string]: unknown
}

export interface ChapterWithRelations {
  chapter: Chapter
  lessons: Lesson[]
  exercise: Exercise | null
}
