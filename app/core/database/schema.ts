/**
 * schema.ts - Drizzle ORM 数据库表定义
 * 
 * 设计意图：
 * =========
 * 使用 Drizzle ORM 定义 PostgreSQL 数据库表结构，提供类型安全的数据访问。
 * 
 * 为什么选择 Drizzle ORM？
 * =====================
 * 1. **类型安全**：基于 TypeScript 的类型推断，编译时就能发现类型错误
 * 2. **零配置迁移**：自动生成 SQL 迁移文件
 * 3. **性能**：编译时生成 SQL，运行时开销小
 * 4. **灵活性**：支持 raw SQL 和 ORM 两种方式
 * 
 * 替代方案对比：
 * =============
 * | ORM | 优点 | 缺点 |
 * |-----|------|------|
 * | **Drizzle** | 类型安全，性能好，迁移方便 | 生态相对较小 |
 * | Prisma | 生态成熟，文档完善 | 运行时开销大，类型不够灵活 |
 * | TypeORM | 功能全面 | 类型推断弱，学习曲线陡峭 |
 * 
 * 本方案优势：
 * ===========
 * - **类型安全**：所有查询都有完整的类型支持
 * - **性能优秀**：编译时生成 SQL，避免运行时解析
 * - **迁移简单**：自动生成迁移文件，支持增量迁移
 * 
 * 表结构设计说明：
 * ==============
 * 1. courses - 课程表
 * 2. chapters - 章节表（关联 courses）
 * 3. lessons - 课时表（关联 chapters）
 * 4. exercises - 练习表（关联 chapters）
 * 5. assets - 资源表（独立）
 * 
 * 外键设计：
 * =========
 * 使用 `courseId`/`chapterId` 作为数字外键，同时保留 `course`/`chapter` 作为 slug 字段，
 * 这样既支持通过 ID 快速查询，也支持通过 slug 进行人类可读的访问。
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
 * courses 表 - 课程信息
 * 
 * 字段说明：
 * =========
 * - id: 主键，自增
 * - slug: 课程唯一标识（URL 友好），唯一索引
 * - title: 课程标题
 * - summary: 课程摘要
 * - order: 显示顺序（默认 0）
 * - cover: 封面图片 URL
 * - edition: 版本号
 * - body: 课程正文（Markdown）
 * - createdAt: 创建时间（UTC）
 * - updatedAt: 更新时间（UTC），自动更新
 */
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

/**
 * chapters 表 - 章节信息
 * 
 * 字段说明：
 * =========
 * - id: 主键，自增
 * - slug: 章节唯一标识（URL 友好），唯一索引
 * - title: 章节标题
 * - summary: 章节摘要
 * - order: 显示顺序（默认 0）
 * - course: 所属课程的 slug（冗余字段，便于查询）
 * - cover: 封面图片 URL
 * - body: 章节正文（Markdown）
 * - courseId: 所属课程的 ID（外键）
 * - createdAt: 创建时间（UTC）
 * - updatedAt: 更新时间（UTC），自动更新
 * 
 * 为什么同时存储 courseId 和 course？
 * ================================
 * 1. **性能**：通过 courseId 可以快速 JOIN 查询
 * 2. **灵活性**：通过 course slug 可以直接查询，不需要 JOIN
 * 3. **兼容性**：在数据迁移或 ID 变更时，slug 保持稳定
 */
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

/**
 * lessons 表 - 课时信息
 * 
 * 字段说明：
 * =========
 * - id: 主键，自增
 * - slug: 课时唯一标识（URL 友好），唯一索引
 * - title: 课时标题
 * - summary: 课时摘要
 * - order: 显示顺序（默认 0）
 * - chapter: 所属章节的 slug（冗余字段）
 * - objectives: 学习目标
 * - intro: 简介
 * - body: 课时正文（Markdown）
 * - summaryText: 总结文本
 * - notes: 备注
 * - chapterId: 所属章节的 ID（外键）
 * - createdAt: 创建时间（UTC）
 * - updatedAt: 更新时间（UTC），自动更新
 */
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

/**
 * exercises 表 - 练习信息
 * 
 * 字段说明：
 * =========
 * - id: 主键，自增
 * - slug: 练习唯一标识（URL 友好），唯一索引
 * - title: 练习标题
 * - summary: 练习摘要
 * - description: 练习描述
 * - body: 练习内容（Markdown）
 * - order: 显示顺序（默认 0）
 * - chapter: 所属章节的 slug（冗余字段）
 * - hint: 提示
 * - answer: 答案
 * - analysis: 解析
 * - chapterId: 所属章节的 ID（外键）
 * - createdAt: 创建时间（UTC）
 * - updatedAt: 更新时间（UTC），自动更新
 */
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

/**
 * assets 表 - 资源文件信息
 * 
 * 字段说明：
 * =========
 * - id: 主键，自增
 * - slug: 资源唯一标识，唯一索引
 * - title: 资源标题
 * - type: 资源类型（默认 'file'）
 * - url: 资源 URL
 * - mime: MIME 类型
 * - size: 文件大小（字节）
 * - meta: 元数据（JSON）
 * - createdAt: 创建时间（UTC）
 * - updatedAt: 更新时间（UTC），自动更新
 */
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

/**
 * coursesRelations - 课程表关系定义
 * 
 * 关系说明：
 * =========
 * - chapters: 一对多关系，一个课程包含多个章节
 */
export const coursesRelations = relations(courses, ({ many }) => ({
  chapters: many(chapters)
}))

/**
 * chaptersRelations - 章节表关系定义
 * 
 * 关系说明：
 * =========
 * - courseRef: 一对一关系，关联课程表
 * - lessons: 一对多关系，一个章节包含多个课时
 * - exercises: 一对多关系，一个章节包含多个练习
 */
export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  courseRef: one(courses, {
    fields: [chapters.courseId],
    references: [courses.id]
  }),
  lessons: many(lessons),
  exercises: many(exercises)
}))

/**
 * lessonsRelations - 课时表关系定义
 * 
 * 关系说明：
 * =========
 * - chapterRef: 一对一关系，关联章节表
 */
export const lessonsRelations = relations(lessons, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id]
  })
}))

/**
 * exercisesRelations - 练习表关系定义
 * 
 * 关系说明：
 * =========
 * - chapterRef: 一对一关系，关联章节表
 */
export const exercisesRelations = relations(exercises, ({ one }) => ({
  chapterRef: one(chapters, {
    fields: [exercises.chapterId],
    references: [chapters.id]
  })
}))

/**
 * schema - 导出所有表定义和关系
 * 
 * 使用方式：
 * ========
 * import { schema } from '@core/database'
 * const db = drizzle(pool, { schema })
 */
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
