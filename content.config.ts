// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

/**
 * 课程集合（Course Metadata）
 * type: data — 课程元数据，不生成页面路由
 */
const courses = defineCollection({
  type: 'data',
  source: 'courses/**/_course.yml',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    order: z.number().default(0),
  }),
})

/**
 * 章节集合（Chapter Pages）
 * type: page — 章节内容页面，生成路由
 */
const chapters = defineCollection({
  type: 'page',
  source: 'courses/**/*.md',
  schema: z.object({
    title: z.string(),
    order: z.number(),
    course: z.string(),
    chapterType: z.enum(['lesson', 'exercise']).optional(),
    duration: z.number().optional(),
  }),
})

export default defineContentConfig({
  collections: {
    courses,
    chapters,
  },
})
