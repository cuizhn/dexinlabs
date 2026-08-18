/**
 * 数据库表结构定义（Drizzle ORM Schema）
 *
 * 定义了课程、知识主题、教学章节、课时、练习五张表及其关联关系。
 *
 * 架构 V4（定稿）：Course → Topic → Chapter → Lesson
 * - Course：课程入口（id, slug, title）
 * - Topic：知识领域（URL 一级路径）
 * - Chapter：教学组织单元（不参与 URL）
 * - Lesson：最小学习单元（同时具有 topic_id 和 chapter_id）
 */
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core'

import { relations, sql } from 'drizzle-orm'

/**
 * courses 表 — 课程
 *
 * 只保留核心字段：id, slug, title。
 * slug 唯一约束。
 */
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull()
}, table => [
  uniqueIndex('idx_courses_slug_unique').on(table.slug)
])

/**
 * topics 表 — 知识主题
 *
 * 只保留核心字段：id, slug, title, order。
 * slug 唯一约束。
 * URL 一级路径来源（/courses/{topic.slug}）。
 */
export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  order: integer('order').default(0).notNull()
}, table => [
  uniqueIndex('idx_topics_slug_unique').on(table.slug),
  index('idx_topics_order').on(table.order)
])

/**
 * chapters 表 — 教学章节
 *
 * 通过 topic_id 关联所属知识主题。
 * 组织 Lesson 学习顺序，不参与 URL。
 * 新增 slug 字段用于内部标识。
 */
export const chapters = pgTable('chapters', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  order: integer('order').default(0).notNull(),
  topicId: integer('topic_id').references(() => topics.id, { onDelete: 'cascade' })
}, table => [
  uniqueIndex('idx_chapters_topic_slug_unique').on(table.topicId, table.slug),
  index('idx_chapters_topic_id').on(table.topicId),
  index('idx_chapters_order').on(table.order)
])

/**
 * lessons 表 — 课时（最小学习单元）
 *
 * 同时具有知识归属（topic_id）和教学归属（chapter_id）。
 * 唯一约束：(topic_id, slug) 组合唯一，允许不同主题下存在相同 slug。
 */
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  order: integer('order').default(0).notNull(),
  /** Lesson AST 结构化内容（JSONB） */
  content: jsonb('content'),
  /** AST 版本号：1 = LessonContent 格式（与 shared/lessonAST.ts 对齐） */
  astVersion: integer('ast_version').default(1).notNull(),
  /** 知识归属：所属知识主题 */
  topicId: integer('topic_id').references(() => topics.id, { onDelete: 'set null' }),
  /** 教学归属：所属教学章节 */
  chapterId: integer('chapter_id').references(() => chapters.id, { onDelete: 'set null' })
}, table => [
  uniqueIndex('idx_lessons_topic_slug_unique').on(table.topicId, table.slug),
  index('idx_lessons_topic_id').on(table.topicId),
  index('idx_lessons_chapter_id').on(table.chapterId),
  index('idx_lessons_order').on(table.order)
])

/**
 * exercises 表 — 练习
 *
 * 通过 topic_id 关联所属知识主题。
 */
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  order: integer('order').default(0).notNull(),
  /** Exercise AST 结构化内容（JSONB） */
  content: jsonb('content'),
  /** AST 版本号：1 = Exercise AST 格式 */
  astVersion: integer('ast_version').default(1).notNull(),
  topicId: integer('topic_id').references(() => topics.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .$onUpdateFn(() => new Date())
    .notNull()
}, table => [
  uniqueIndex('idx_exercises_slug_unique').on(table.slug),
  index('idx_exercises_topic_id').on(table.topicId),
  index('idx_exercises_order').on(table.order)
])

/**
 * 关系定义 — 使用整数外键关联
 *
 * Course → Topic → Chapter → Lesson
 * 注意：topics 不再有 course_id，因此 topicsRelations 不包含 course 关系
 */
export const coursesRelations = relations(courses, (_helpers) => ({
  // Course 与 Topic 的业务关系不再通过数据库 FK 维护
  // 由 Service 层负责组装
}))

export const topicsRelations = relations(topics, ({ many }) => ({
  chapters: many(chapters),
  lessons: many(lessons),
  exercises: many(exercises)
}))

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  topic: one(topics, {
    fields: [chapters.topicId],
    references: [topics.id]
  }),
  lessons: many(lessons)
}))

export const lessonsRelations = relations(lessons, ({ one }) => ({
  topic: one(topics, {
    fields: [lessons.topicId],
    references: [topics.id]
  }),
  chapter: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id]
  })
}))

export const exercisesRelations = relations(exercises, ({ one }) => ({
  topic: one(topics, {
    fields: [exercises.topicId],
    references: [topics.id]
  })
}))

export const schema = {
  courses,
  topics,
  chapters,
  lessons,
  exercises,
  coursesRelations,
  topicsRelations,
  chaptersRelations,
  lessonsRelations,
  exercisesRelations
}

export default schema
