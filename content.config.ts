// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

/**
 * 章节配置集合（Chapter Config）
 * type: data — 章节是核心组织单元，包含 id、slug、title、order、lessons 列表
 * 每个 Chapter 维护课时顺序、入口、练习入口；与 Lesson 是单向组织关系
 */
const chapter = defineCollection({
  type: 'data',
  source: 'chapter/**/*.yml',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
    order: z.number().default(0),
    lessons: z.array(z.string()).default([]),
  }),
})

/**
 * 课程内容集合（Lesson Content）
 * type: page — 课时正文内容，slug 全局唯一，不维护归属关系
 * 由 Chapter.lessons 数组组织顺序
 */
const lesson = defineCollection({
  type: 'page',
  source: 'lesson/**/*.md',
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
  }),
})

/**
 * 练习集合（Exercise）
 * type: data — 每个 Chapter 对应一个 Exercise，slug 与 Chapter.slug 一致
 */
const exercise = defineCollection({
  type: 'data',
  source: 'exercise/**/*.yml',
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
    questions: z.array(z.unknown()).default([]),
  }),
})

export default defineContentConfig({
  collections: {
    chapter,
    lesson,
    exercise,
  },
})
