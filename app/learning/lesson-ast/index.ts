/**
 * Lesson AST 模块入口
 *
 * LessonAST 是当前项目与 dexinlabs-content 之间的内容结构契约。
 * ⚠️ SOURCE OF TRUTH: dexinlabs-content/src/types/ast.ts
 */
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
} from './types'

export {
  BLOCK_TYPES,
  HINT_LEVELS,
  HEADING_LEVELS
} from './constants'
