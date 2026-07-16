import { FileSource, DatabaseSource } from './sources/index'
import type { ContentSource } from './sources/index'
import { queries } from './queries/index'
import type {
  Course,
  Chapter,
  Lesson,
  Exercise,
  ChapterListOptions
} from './models/index'
import type { LessonPage, ChapterPage, CoursePage } from './dto/index'

export interface ContentEngineFacade {
  getCourse(slug: string): Promise<Course | null>
  getChapter(slug: string): Promise<ChapterPage | null>
  getLesson(slug: string): Promise<Lesson | null>
  getExercise(slug: string): Promise<Exercise | null>
  listCourses(): Promise<Course[]>
  listChapters(opts?: ChapterListOptions): Promise<Chapter[]>
  listLessons(chapterSlug?: string): Promise<Lesson[]>
  getLessonPage(slug: string): Promise<LessonPage | null>
  getChapterPage(slug: string): Promise<ChapterPage | null>
  getCoursePage(slug: string): Promise<CoursePage | null>
  getDefaultCourse(): Promise<CoursePage | null>
}

let __initialized = false
let __source: ContentSource | null = null

function getSourceType(): 'file' | 'database' {
  const env = process.env.CONTENT_SOURCE?.toLowerCase() || ''
  return env === 'file' ? 'file' : 'database'
}

function createSource(): ContentSource {
  const type = getSourceType()
  if (type === 'file') {
    return new FileSource()
  }
  return new DatabaseSource()
}

async function ensureInitialized(): Promise<void> {
  if (__initialized) return

  const type = getSourceType()

  if (type === 'database') {
    try {
      await import('../database')
    } catch {
      // 忽略导入错误，可能是开发环境没有配置数据库
    }
  }

  __source = createSource()
  __initialized = true
}

const facade: ContentEngineFacade = {
  async getCourse(slug: string): Promise<Course | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getCourse(q.slug) || null
  },

  async getChapter(slug: string): Promise<ChapterPage | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getChapterPage(q.slug) || null
  },

  async getLesson(slug: string): Promise<Lesson | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getLesson(q.slug) || null
  },

  async getExercise(slug: string): Promise<Exercise | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getExercise(q.slug) || null
  },

  async listCourses(): Promise<Course[]> {
    await ensureInitialized()
    return __source?.listCourses() || []
  },

  async listChapters(opts: ChapterListOptions = {}): Promise<Chapter[]> {
    const q = queries.normalizeListChapters(opts)
    await ensureInitialized()
    return __source?.listChapters(q.courseSlug || undefined) || []
  },

  async listLessons(chapterSlug?: string): Promise<Lesson[]> {
    await ensureInitialized()
    return __source?.listLessons(chapterSlug) || []
  },

  async getLessonPage(slug: string): Promise<LessonPage | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getLessonPage(q.slug) || null
  },

  async getChapterPage(slug: string): Promise<ChapterPage | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getChapterPage(q.slug) || null
  },

  async getCoursePage(slug: string): Promise<CoursePage | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    await ensureInitialized()
    return __source?.getCoursePage(q.slug) || null
  },

  async getDefaultCourse(): Promise<CoursePage | null> {
    await ensureInitialized()
    return __source?.getDefaultCourse() || null
  }
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
} from '@database/repositories'

export { queries } from './queries/index'
export { FileSource, DatabaseSource } from './sources/index'
export type { ContentSource } from './sources/index'

export type {
  Course,
  Chapter,
  Lesson,
  Exercise,
  Asset,
  BaseContentEntity,
  ChapterListOptions
} from './models/index'

export type {
  LessonPage,
  ChapterPage,
  CoursePage
} from './dto/index'

export default facade
