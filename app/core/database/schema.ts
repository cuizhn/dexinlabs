import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core'

import { relations, sql } from 'drizzle-orm'

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  order: integer('display_order').default(0).notNull(),
  cover: text('cover'),
  edition: text('edition'),
  body: text('body'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .$onUpdateFn(() => new Date())
    .notNull()
}, table => ({
  coursesSlugUnique: uniqueIndex('idx_courses_slug_unique').on(table.slug),
  coursesOrderIdx: index('idx_courses_order').on(table.order),
  coursesSlugIdx: index('idx_courses_slug').on(table.slug)
}))

export const chapters = pgTable('chapters', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  order: integer('display_order').default(0).notNull(),
  course: varchar('course_slug', { length: 255 }),
  cover: text('cover'),
  body: text('body'),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .$onUpdateFn(() => new Date())
    .notNull()
}, table => ({
  chaptersSlugUnique: uniqueIndex('idx_chapters_slug_unique').on(table.slug),
  chaptersCourseIdx: index('idx_chapters_course_id').on(table.courseId),
  chaptersOrderIdx: index('idx_chapters_order').on(table.order),
  chaptersSlugIdx: index('idx_chapters_slug').on(table.slug),
  chaptersCourseSlugIdx: index('idx_chapters_course_slug').on(table.course)
}))

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  order: integer('display_order').default(0).notNull(),
  chapter: varchar('chapter_slug', { length: 255 }),
  objectives: text('objectives'),
  intro: text('intro'),
  body: text('body'),
  summaryText: text('summary_text'),
  notes: text('notes'),
  chapterId: integer('chapter_id').references(() => chapters.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .$onUpdateFn(() => new Date())
    .notNull()
}, table => ({
  lessonsSlugUnique: uniqueIndex('idx_lessons_slug_unique').on(table.slug),
  lessonsChapterIdx: index('idx_lessons_chapter_id').on(table.chapterId),
  lessonsOrderIdx: index('idx_lessons_order').on(table.order),
  lessonsSlugIdx: index('idx_lessons_slug').on(table.slug),
  lessonsChapterSlugIdx: index('idx_lessons_chapter_slug').on(table.chapter)
}))

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  description: text('description'),
  body: text('body'),
  order: integer('display_order').default(0).notNull(),
  chapter: varchar('chapter_slug', { length: 255 }),
  hint: text('hint'),
  answer: text('answer'),
  analysis: text('analysis'),
  chapterId: integer('chapter_id').references(() => chapters.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .$onUpdateFn(() => new Date())
    .notNull()
}, table => ({
  exercisesSlugUnique: uniqueIndex('idx_exercises_slug_unique').on(table.slug),
  exercisesChapterIdx: index('idx_exercises_chapter_id').on(table.chapterId),
  exercisesOrderIdx: index('idx_exercises_order').on(table.order),
  exercisesSlugIdx: index('idx_exercises_slug').on(table.slug),
  exercisesChapterSlugIdx: index('idx_exercises_chapter_slug').on(table.chapter)
}))

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 64 }).default('file').notNull(),
  url: text('url').notNull(),
  mime: varchar('mime', { length: 128 }),
  size: integer('size_bytes'),
  meta: text('meta'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .$onUpdateFn(() => new Date())
    .notNull()
}, table => ({
  assetsSlugUnique: uniqueIndex('idx_assets_slug_unique').on(table.slug)
}))

export const coursesRelations = relations(courses, ({ many }) => ({
  chapters: many(chapters)
}))

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  courseRef: one(courses, {
    fields: [chapters.courseId],
    references: [courses.id]
  }),
  lessons: many(lessons),
  exercises: many(exercises)
}))

export const lessonsRelations = relations(lessons, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id]
  })
}))

export const exercisesRelations = relations(exercises, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [exercises.chapterId],
    references: [chapters.id]
  })
}))

export const schema = {
  courses,
  chapters,
  lessons,
  exercises,
  assets,
  coursesRelations,
  chaptersRelations,
  lessonsRelations,
  exercisesRelations
}

export default schema
