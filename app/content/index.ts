/**
 * Content 模块统一入口
 *
 * 对外暴露服务、仓储和类型定义，供 API 层和其他模块使用。
 */
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
  exerciseRepository
} from './repositories/index'

export type {
  Course,
  Chapter,
  Lesson,
  Exercise,
  BaseContentEntity,
  ChapterListOptions,
  LessonPage,
  ChapterPage,
  CoursePage
} from './models/index'
