// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

/**
 * 课程集合（Course Metadata）
 * type: data — 课程元数据，不生成页面路由
 */
const courses = defineCollection({
  type: 'data',
  source: 'courses/**/*.yml',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    order: z.number().default(0),
  }),
})



/**
 * 课程内容集合（Lesson Content）
 * type: page — 课程内容文件，包含 slug、title、description
 */
const lesson = defineCollection({
  type: 'page',
  source: 'lesson/**/*.md',
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
})

/**
 * 章节配置集合（Chapter Config）
 * type: data — 章节配置文件，包含 id、slug、order 和 lessons 列表
 */
const chapters = defineCollection({
  type: 'data',
  source: 'chapter/**/*.yml',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    order: z.number().default(0),
    lessons: z.array(z.string()),
  }),
})

export default defineContentConfig({
  collections: {
    courses,
    chapters,
    lesson,
  },
})
