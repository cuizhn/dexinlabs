import { createLessonShim, createChapterShim, createCourseShim } from '@shared/types'
import type { LessonDoc, ChapterDoc, CourseDoc } from '@shared/types'

export type SchemaFieldType =
  | 'string'
  | 'number'
  | 'string|number'
  | 'array'
  | 'boolean'
  | 'object'

export interface SchemaFieldDef {
  type: SchemaFieldType
  nullable?: boolean
  default?: unknown
}

export interface SchemaDef<T extends object = object> {
  name: string
  collection: string
  required: readonly string[]
  defaults: () => T
  fields: Record<string, SchemaFieldDef>
}

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

export type LessonSchemaFields = {
  id: number | string | null
  slug: string
  title: string
  summary?: string | null
  content?: string | null
  order?: number
  chapter?: string | null
}

export type ChapterSchemaFields = {
  id: number | string | null
  slug: string
  title: string
  summary?: string | null
  order?: number
  course?: string | null
  lessons?: LessonDoc[]
}

export type CourseSchemaFields = {
  id: number | string | null
  slug: string
  title: string
  summary?: string | null
  order?: number
  chapters?: ChapterDoc[]
}

export const LessonSchema: SchemaDef<LessonDoc> = {
  name: 'Lesson',
  collection: 'lesson',
  required: ['slug', 'title'],
  defaults: () => createLessonShim(),
  fields: {
    id: { type: 'string|number', nullable: true },
    slug: { type: 'string', nullable: false },
    title: { type: 'string', nullable: false },
    summary: { type: 'string', nullable: true },
    content: { type: 'string', nullable: true },
    order: { type: 'number', default: 0 },
    chapter: { type: 'string', nullable: true }
  }
}

export const ChapterSchema: SchemaDef<ChapterDoc> = {
  name: 'Chapter',
  collection: 'chapter',
  required: ['slug', 'title'],
  defaults: () => createChapterShim(),
  fields: {
    id: { type: 'string|number', nullable: true },
    slug: { type: 'string', nullable: false },
    title: { type: 'string', nullable: false },
    summary: { type: 'string', nullable: true },
    order: { type: 'number', default: 0 },
    course: { type: 'string', nullable: true },
    lessons: { type: 'array', default: () => [] }
  }
}

export const CourseSchema: SchemaDef<CourseDoc> = {
  name: 'Course',
  collection: 'course',
  required: ['slug', 'title'],
  defaults: () => createCourseShim(),
  fields: {
    id: { type: 'string|number', nullable: true },
    slug: { type: 'string', nullable: false },
    title: { type: 'string', nullable: false },
    summary: { type: 'string', nullable: true },
    order: { type: 'number', default: 0 },
    chapters: { type: 'array', default: () => [] }
  }
}

export function validateSchema<T extends Record<string, unknown>>(
  schema: SchemaDef<T>,
  doc: unknown
): ValidationResult {
  const errors: string[] = []
  const docRecord = doc as Record<string, unknown> | undefined | null
  for (const field of schema.required || []) {
    const value = docRecord?.[field]
    if (value === undefined || value === null || value === '') {
      errors.push(`[${schema.name}] Missing required field: ${field}`)
    }
  }
  return { ok: errors.length === 0, errors }
}

export default { LessonSchema, ChapterSchema, CourseSchema, validateSchema }
