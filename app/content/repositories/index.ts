/**
 * 仓储层统一导出
 *
 * 只导出外部使用的仓储实例和必要类型，
 * 内部基类不对外暴露。
 */
export { CourseRepository, courseRepository } from './CourseRepository'
export { TopicRepository, topicRepository } from './TopicRepository'
export { ChapterRepository, chapterRepository } from './ChapterRepository'
export { LessonRepository, lessonRepository } from './LessonRepository'
export { ExerciseRepository, exerciseRepository } from './ExerciseRepository'
