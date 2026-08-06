/**
 * Content 模块统一入口
 *
 * 对外暴露服务、仓储和类型定义，供 API 层和其他模块使用。
 *
 * 架构 V4：Course → Topic → Chapter → Lesson
 * 内容存储：Lesson AST（JSONB），由 dexinlabs-content 项目编译
 */
export {
  topicService,
  courseService,
  lessonService,
  exerciseService
} from './services/index'

export {
  topicRepository,
  chapterRepository,
  lessonRepository,
  courseRepository,
  exerciseRepository
} from './repositories/index'

export type {
  Course,
  Topic,
  Chapter,
  Lesson,
  Exercise,
  BaseContentEntity,
  LessonPage,
  TopicPage,
  CoursePage,
  ChapterWithLessons,
  ExercisePage
} from './types/index'

/** Lesson AST 类型系统（只读副本，源真相在 dexinlabs-content/src/types/ast.ts） */
export type {
  LessonContent,
  ExerciseContent,
  Block,
  BlockType,
  BaseBlock,
  ParagraphBlock,
  HeadingBlock,
  ImageBlock,
  ListBlock,
  TableBlock,
  FormulaBlock,
  CodeBlock,
  QuoteBlock,
  HintBlock,
  DefinitionBlock,
  ExampleBlock,
  QuestionBlock,
  SectionBlock,
  DividerBlock
} from './types/ast'

export {
  BLOCK_TYPES,
  HINT_LEVELS,
  HEADING_LEVELS
} from './types/ast'
