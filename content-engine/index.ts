import {
  chapterService,
  courseService,
  lessonService,
  exerciseService
} from './services/index'
import { queries } from './queries/index'
import type {
  Course,
  Chapter,
  Lesson,
  Exercise,
  ChapterListOptions,
  QueryOptions,
  ChapterWithRelations
} from './models/index'

export interface ContentEngineFacade {
  getCourse(slug: string, opts?: QueryOptions): Promise<Course | null>
  getChapter(slug: string, opts?: QueryOptions): Promise<ChapterWithRelations | null>
  getLesson(slug: string, opts?: QueryOptions): Promise<Lesson | null>
  getExercise(slug: string, opts?: QueryOptions): Promise<Exercise | null>
  listChapters(opts?: ChapterListOptions): Promise<Chapter[]>
}

let __initialized = false

async function ensureInitialized(): Promise<void> {
  if (__initialized) return
  try {
    const boot = await import('../app/boot/index')
    if (typeof boot.bootContentEngine === 'function') {
      await boot.bootContentEngine()
    }
  } catch {
  }
  __initialized = true
}

const facade: ContentEngineFacade = {
  async getCourse(slug: string, opts: QueryOptions = {}): Promise<Course | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    const result = await courseService.getBySlug(q.slug) as Course | null
    return result as Course | null
  },

  async getChapter(slug: string, opts: QueryOptions = {}): Promise<ChapterWithRelations | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return chapterService.getBySlug(q.slug) as Promise<ChapterWithRelations | null>
  },

  async getLesson(slug: string, opts: QueryOptions = {}): Promise<Lesson | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return lessonService.getBySlug(q.slug) as Promise<Lesson | null>
  },

  async getExercise(slug: string, opts: QueryOptions = {}): Promise<Exercise | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return exerciseService.getBySlug(q.slug) as Promise<Exercise | null>
  },

  async listChapters(opts: ChapterListOptions = {}): Promise<Chapter[]> {
    const q = queries.normalizeListChapters(opts)
    await ensureInitialized()
    const courseSlug = q.courseSlug || undefined
    const result = await chapterService.list(courseSlug)
    return result as unknown as Chapter[]
  }
}

export function createContentEngine(): ContentEngineFacade {
  return facade
}

export function getContentEngine(): ContentEngineFacade {
  return facade
}

export {
  chapterService,
  courseService,
  lessonService,
  exerciseService
} from './services/index'

export {
  chapterRepository,
  lessonRepository,
  courseRepository,
  exerciseRepository,
  assetRepository
} from './repositories/index'

export { queries } from './queries/index'

export type {
  Course,
  Chapter,
  Lesson,
  Exercise,
  Asset,
  BaseContentEntity,
  ChapterListOptions,
  QueryOptions,
  ChapterWithRelations
} from './models/index'

export type {
  BySlugQuery,
  ByCourseQuery,
  ByChapterQuery,
  ListSortQuery,
  ListPaginateQuery,
  ListChaptersQuery,
  ListLessonsQuery,
  ListExercisesQuery,
  NormalizedBySlugQuery,
  NormalizedByCourseQuery,
  NormalizedByChapterQuery,
  NormalizedListSort,
  NormalizedListPaginate,
  NormalizedListChaptersQuery,
  NormalizedListLessonsQuery,
  NormalizedListExercisesQuery
} from './queries/index'

export default facade
