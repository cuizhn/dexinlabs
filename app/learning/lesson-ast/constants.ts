/**
 * Lesson AST 运行时常量
 *
 * 供校验、类型守卫等场景使用。
 */
import type { BlockType, HintBlock, HeadingBlock } from './types'

/**
 * BLOCK_TYPES - 所有合法 Block 类型的运行时常量
 */
export const BLOCK_TYPES: readonly BlockType[] = [
  'paragraph',
  'heading',
  'image',
  'list',
  'table',
  'formula',
  'code',
  'quote',
  'hint',
  'definition',
  'example',
  'question',
  'section',
  'divider'
] as const

/**
 * HINT_LEVELS - HintBlock 的合法级别
 */
export const HINT_LEVELS: readonly HintBlock['level'][] = [
  'info',
  'tip',
  'warning',
  'danger'
] as const

/**
 * HEADING_LEVELS - HeadingBlock 的合法层级
 */
export const HEADING_LEVELS: readonly HeadingBlock['level'][] = [
  1, 2, 3, 4
] as const
