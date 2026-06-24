// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

/**
 * 课程集合（Course Metadata）
 * type: data — 课程元数据，不生成页面路由
 */
const courses = defineCollection({
  type: 'data',
  source: 'courses/course.yml',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    order: z.number().default(0),
  }),
})

/**
 * 章节集合（Chapter Pages）
 * type: page — 章节内容页面，生成路由
 */
const chapters = defineCollection({
  type: 'page',
 source: 'courses/**/[^_]*.md',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    order: z.number(),
  }),
})

export default defineContentConfig({
  collections: {
    courses,
    chapters,
  },
})
