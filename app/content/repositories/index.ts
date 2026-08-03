/**
 * 仓储层统一导出
 *
 * 只导出外部使用的仓储实例和必要类型，
 * 内部基类和关系类型不对外暴露。
 */
export { DomainRepository, domainRepository } from './DomainRepository'
export { TopicRepository, topicRepository } from './TopicRepository'
export { LessonRepository, lessonRepository } from './LessonRepository'
export { ExerciseRepository, exerciseRepository } from './ExerciseRepository'
