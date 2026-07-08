/**
 * Lazy Query Facade — 给业务层/Page 调用的统一数据查询门面。
 *
 * 符合 Data Side 纯数据约束：
 *   - 所有方法仅走 Loader → Service → Repository → Drizzle 链路
 *   - 不做任何 Markdown 解析、不做 AST 变换、不调用 Parser / Transformer / Renderer
 *   - 通过动态 import() 懒加载 Loader，避免模块加载时就建立 DB 连接
 *
 * QueryContract 接口对齐：
 *   getCourse / getChapter / getLesson / getExercise / listChapters
 */

import type {
  Course,
  Chapter,
  Lesson,
  Exercise,
  LoaderOptions,
  ChapterListOptions
} from '@core/contracts/Loader'

import type {
  QueryOptions,
  QueryChapterListOptions,
  QueryContractMethods,
  SourceContractMethods
} from '@core/contracts/data'

export interface LazyQueryExerciseOptions extends QueryOptions {
  source?: SourceContractMethods
}

export interface LazyQueryLoader {
  loadCourse: (slug: string, opts?: LoaderOptions) => Promise<Course | null>
  loadChapter: (slug: string, opts?: LoaderOptions) => Promise<Chapter | null>
  loadLesson: (slug: string, opts?: LoaderOptions) => Promise<Lesson | null>
  listChapters: (opts?: ChapterListOptions) => Promise<Chapter[]>
}

export interface LazyQueryServices {
  courseService: {
    exercises?: {
      getBySlug?: (slug: string) => Promise<Exercise | null>
    }
  }
}

export function buildLazyQueryFacade(): QueryContractMethods {
  return {
    async getCourse<TOptions extends QueryOptions = QueryOptions>(
      slug: string,
      opts: TOptions = {} as TOptions
    ): Promise<Course | null> {
      const { loadCourse } = await import('@data/_internal/loaders/course') as unknown as LazyQueryLoader
      return loadCourse(slug, opts)
    },

    async getChapter<TOptions extends QueryOptions = QueryOptions>(
      slug: string,
      opts: TOptions = {} as TOptions
    ): Promise<Chapter | null> {
      const { loadChapter } = await import('@data/_internal/loaders/chapter') as unknown as LazyQueryLoader
      return loadChapter(slug, opts)
    },

    async getLesson<TOptions extends QueryOptions = QueryOptions>(
      slug: string,
      opts: TOptions = {} as TOptions
    ): Promise<Lesson | null> {
      const { loadLesson } = await import('@data/_internal/loaders/lesson') as unknown as LazyQueryLoader
      return loadLesson(slug, opts)
    },

    async getExercise<TOptions extends QueryOptions = QueryOptions>(
      slug: string,
      opts: TOptions = {} as TOptions
    ): Promise<Exercise | null> {
      const exerciseOpts = opts as LazyQueryExerciseOptions
      if (exerciseOpts && exerciseOpts.source) {
        return exerciseOpts.source.findOne<Exercise>('exercise', { slug })
      }
      const { default: services } = await import('@data/services') as unknown as { default: LazyQueryServices }
      const { courseService } = services
      return courseService.exercises?.getBySlug?.(slug) || null
    },

    async listChapters<TOptions extends QueryChapterListOptions = QueryChapterListOptions>(
      opts: TOptions = {} as TOptions
    ): Promise<Chapter[]> {
      const { listChapters } = await import('@data/_internal/loaders/chapter') as unknown as LazyQueryLoader
      return listChapters(opts)
    }
  }
}

export const lazyQuery: QueryContractMethods = buildLazyQueryFacade()

export default buildLazyQueryFacade
