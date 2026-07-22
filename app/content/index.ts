/**
 * Content 模块统一入口
 *
 * 对外暴露服务、仓储和类型定义，供 API 层和其他模块使用。
 *
 * 架构 V2：Domain（知识领域）→ Topic（知识主题）→ Lesson（课时）
 */
export {
  topicService,
  domainService,
  lessonService,
  exerciseService
} from './services/index'

export {
  topicRepository,
  lessonRepository,
  domainRepository,
  exerciseRepository
} from './repositories/index'

export type {
  Domain,
  Topic,
  Lesson,
  Exercise,
  BaseContentEntity,
  TopicListOptions,
  LessonPage,
  TopicPage,
  DomainPage
} from './models/index'
