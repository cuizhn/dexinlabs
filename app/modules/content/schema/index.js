import { createLessonShim, createChapterShim, createCourseShim } from '../types'

export const LessonSchema = {
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

export const ChapterSchema = {
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

export const CourseSchema = {
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

export function validateSchema(schema, doc) {
  const errors = []
  for (const field of schema.required || []) {
    if (doc?.[field] === undefined || doc?.[field] === null || doc?.[field] === '') {
      errors.push(`[${schema.name}] Missing required field: ${field}`)
    }
  }
  return { ok: errors.length === 0, errors }
}

export default { LessonSchema, ChapterSchema, CourseSchema, validateSchema }
