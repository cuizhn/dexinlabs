/**
 * 数据库表结构定义（Drizzle ORM Schema）
 *
 * 定义了知识领域、知识主题、课时、练习四张表及其关联关系。
 * 表之间通过 slug 字段建立关系查询（Drizzle relations），
 * 同时保留整数外键（domainId、topicId）用于数据库级约束。
 *
 * 架构 V2：Domain（知识领域）→ Topic（知识主题）→ Lesson（课时）
 * Domain 是精简的分类节点，不是内容实体。
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

/**
 * domains 表 — 知识领域（原 courses 表）
 *
 * 精简为分类节点，仅保留 id, slug, title, description, order。
 * Domain 不是内容实体，不需要 cover、body、edition 等展示字段。
 */
export const domains = pgTable('domains', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('display_order').default(0).notNull()
}, table => [
  uniqueIndex('idx_domains_slug_unique').on(table.slug),
  index('idx_domains_order').on(table.order)
])

/**
 * topics 表 — 知识主题（原 chapters 表）
 *
 * 外键从 course/courseId 改为 domain/domainId。
 */
export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  order: integer('display_order').default(0).notNull(),
  domain: varchar('domain_slug', { length: 255 }),
  cover: text('cover'),
  body: text('body'),
  domainId: integer('domain_id').references(() => domains.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .$onUpdateFn(() => new Date())
    .notNull()
}, table => [
  uniqueIndex('idx_topics_slug_unique').on(table.slug),
  index('idx_topics_domain_id').on(table.domainId),
  index('idx_topics_order').on(table.order),
  index('idx_topics_domain_slug').on(table.domain)
])

/**
 * lessons 表 — 课时（最小学习单元）
 *
 * 外键从 chapter/chapterId 改为 topic/topicId。
 */
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  order: integer('display_order').default(0).notNull(),
  topic: varchar('topic_slug', { length: 255 }),
  objectives: text('objectives'),
  intro: text('intro'),
  body: text('body'),
  summaryText: text('summary_text'),
  notes: text('notes'),
  topicId: integer('topic_id').references(() => topics.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`timezone('utc'::text, now())`)
    .$onUpdateFn(() => new Date())
    .notNull()
}, table => [
  uniqueIndex('idx_lessons_slug_unique').on(table.slug),
  index('idx_lessons_topic_id').on(table.topicId),
  index('idx_lessons_order').on(table.order),
  index('idx_lessons_topic_slug').on(table.topic)
])

/**
 * exercises 表 — 练习
 *
 * 外键从 chapter/chapterId 改为 topic/topicId。
 */
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  description: text('description'),
  body: text('body'),
  order: integer('display_order').default(0).notNull(),
  topic: varchar('topic_slug', { length: 255 }),
  hint: text('hint'),
  answer: text('answer'),
  analysis: text('analysis'),
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
  index('idx_exercises_order').on(table.order),
  index('idx_exercises_topic_slug').on(table.topic)
])

/**
 * 关系定义 — 使用 slug 关联（而非整数外键）
 *
 * 业务层（Repository/API 路由）主要按 slug 查询，slug 上已有唯一索引。
 * 整数外键（domainId 等）仅用于数据库级约束（级联删除等）。
 */
export const domainsRelations = relations(domains, ({ many }) => ({
  topics: many(topics)
}))

export const topicsRelations = relations(topics, ({ one, many }) => ({
  domainRef: one(domains, {
    fields: [topics.domain],
    references: [domains.slug]
  }),
  lessons: many(lessons),
  exercises: many(exercises)
}))

export const lessonsRelations = relations(lessons, ({ one }) => ({
  topicRef: one(topics, {
    fields: [lessons.topic],
    references: [topics.slug]
  })
}))

export const exercisesRelations = relations(exercises, ({ one }) => ({
  topicRef: one(topics, {
    fields: [exercises.topic],
    references: [topics.slug]
  })
}))

export const schema = {
  domains,
  topics,
  lessons,
  exercises,
  domainsRelations,
  topicsRelations,
  lessonsRelations,
  exercisesRelations
}

export default schema
