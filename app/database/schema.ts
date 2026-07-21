/**
 * 数据库表结构定义（Drizzle ORM Schema）
 *
 * 定义了课程、章节、课时、练习四张表及其关联关系。
 * 表之间通过 slug 字段建立关系查询（Drizzle relations），
 * 同时保留整数外键（courseId、chapterId）用于数据库级约束。
 */
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
  // 注意：$onUpdateFn 仅在通过 Drizzle ORM 更新记录时生效，
  // 原生 SQL 更新需手动设置 updated_at 或通过数据库触发器实现
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .$onUpdateFn(() => new Date())
    .notNull()
}, table => [
  uniqueIndex('idx_courses_slug_unique').on(table.slug),
  index('idx_courses_order').on(table.order)
])

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
}, table => [
  uniqueIndex('idx_chapters_slug_unique').on(table.slug),
  index('idx_chapters_course_id').on(table.courseId),
  index('idx_chapters_order').on(table.order),
  index('idx_chapters_course_slug').on(table.course)
])

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
}, table => [
  uniqueIndex('idx_lessons_slug_unique').on(table.slug),
  index('idx_lessons_chapter_id').on(table.chapterId),
  index('idx_lessons_order').on(table.order),
  index('idx_lessons_chapter_slug').on(table.chapter)
])

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
}, table => [
  uniqueIndex('idx_exercises_slug_unique').on(table.slug),
  index('idx_exercises_chapter_id').on(table.chapterId),
  index('idx_exercises_order').on(table.order),
  index('idx_exercises_chapter_slug').on(table.chapter)
])

export const coursesRelations = relations(courses, ({ many }) => ({
  chapters: many(chapters)
}))

/**
 * 关系定义使用 slug 关联（而非整数外键），
 * 因为业务层（Repository/API 路由）主要按 slug 查询，slug 上已有唯一索引。
 * 整数外键（courseId 等）仅用于数据库级约束（级联删除等）。
 */
export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  courseRef: one(courses, {
    fields: [chapters.course],
    references: [courses.slug]
  }),
  lessons: many(lessons),
  exercises: many(exercises)
}))

export const lessonsRelations = relations(lessons, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [lessons.chapter],
    references: [chapters.slug]
  })
}))

export const exercisesRelations = relations(exercises, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [exercises.chapter],
    references: [chapters.slug]
  })
}))

export const schema = {
  courses,
  chapters,
  lessons,
  exercises,
  coursesRelations,
  chaptersRelations,
  lessonsRelations,
  exercisesRelations
}

export default schema
