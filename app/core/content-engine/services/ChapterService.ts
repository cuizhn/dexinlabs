import {
  chapterRepository,
  lessonRepository,
  exerciseRepository
} from '@core/database/repositories'
import type { ChapterRepository, ChapterListByCourseRow } from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { ExerciseRepository, ExerciseListByChapterRow } from '@core/database/repositories'
import type { Chapter, Lesson, Exercise } from '../models/index'
import { queries } from '../queries/index'

type SelectChapter = Chapter
type SelectLesson = Lesson
type SelectExercise = Exercise

export interface ChapterWithRelations {
  chapter: SelectChapter
  lessons: LessonListByChapterRow[]
  exercise: ExerciseListByChapterRow | null
}

export interface ChapterServiceDeps {
  chapters?: ChapterRepository
  lessons?: LessonRepository
  exercises?: ExerciseRepository
}

export class ChapterService {
  chapters: ChapterRepository
  lessons: LessonRepository
  exercises: ExerciseRepository

  constructor({
    chapters = chapterRepository,
    lessons = lessonRepository,
    exercises = exerciseRepository
  }: ChapterServiceDeps = {}) {
    this.chapters = chapters
    this.lessons = lessons
    this.exercises = exercises
  }

  async list(courseSlug?: string): Promise<ChapterListByCourseRow[] | SelectChapter[]> {
    const q = queries.normalizeListChapters(courseSlug || {})
    if (!courseSlug) return this.chapters.list()
    return this.chapters.listByCourse(q.courseSlug || courseSlug)
  }

  async getBySlug(slug: string): Promise<ChapterWithRelations | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    const chapter = await this.chapters.getBySlug(q.slug)
    if (!chapter) return null
    const lessons = await this.lessons.listByChapter(q.slug)
    const exercise = await this.exercises.getOneByChapter(q.slug)
    return {
      chapter,
      lessons,
      exercise: exercise || null
    }
  }

  async listAll(): Promise<SelectChapter[]> {
    return this.chapters.list()
  }

  async create(
    data: Partial<SelectChapter> & { slug: string; title: string }
  ): Promise<SelectChapter | null> {
    const q = queries.normalizeBySlug(data.slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    if (!String(data.title || '').trim()) throw new Error('title is required')
    const courseQ = queries.normalizeByCourse({ courseSlug: data.course, courseId: data.courseId })
    const courseSlug = courseQ.isValid && courseQ.courseSlug ? courseQ.courseSlug :
      (typeof data.course === 'string' ? data.course : undefined)
    const courseId = courseQ.isValid && courseQ.courseId ? courseQ.courseId :
      (data.courseId !== undefined && data.courseId !== null ? Number(data.courseId) : undefined)
    const payload: Partial<SelectChapter> = {
      slug: q.slug,
      title: String(data.title).trim(),
      summary: typeof data.summary === 'string' ? data.summary : null as unknown as SelectChapter['summary'],
      cover: typeof data.cover === 'string' ? data.cover : null as unknown as SelectChapter['cover'],
      body: typeof data.body === 'string' ? data.body : null as unknown as SelectChapter['body'],
      course: typeof courseSlug === 'string' ? courseSlug : null as unknown as SelectChapter['course'],
      courseId: typeof courseId === 'number' ? courseId : null as unknown as SelectChapter['courseId'],
      order: typeof data.order === 'number' ? data.order : 0
    }
    return this.chapters.create(payload as unknown as Parameters<typeof this.chapters.create>[0])
  }

  async update(slug: string, patch: Partial<SelectChapter>): Promise<SelectChapter | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    const existing = await this.chapters.getBySlug(q.slug)
    if (!existing) return null
    const clean: Partial<SelectChapter> = {}
    const keys: (keyof SelectChapter)[] = ['title', 'summary', 'order', 'cover', 'body', 'course', 'courseId']
    for (const k of keys) {
      if ((patch as unknown as Record<string, unknown>)[k] !== undefined) {
        ;(clean as unknown as Record<string, unknown>)[k] = (patch as unknown as Record<string, unknown>)[k]
      }
    }
    return this.chapters.updateBySlug(q.slug, clean as unknown as Parameters<typeof this.chapters.updateBySlug>[1])
  }

  async remove(slug: string): Promise<{ rowCount: number | null }> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) throw new Error(q.error || 'slug is required')
    return this.chapters.deleteBySlug(q.slug)
  }
}

export const chapterService = new ChapterService()
export default chapterService
