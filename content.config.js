import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const chapter = defineCollection({
  type: 'data',

  source: 'chapter/**/*.yml',

  schema: z.object({
    id: z.string(),

    slug: z.string(),

    title: z.string(),

    description: z.string().optional(),

    order: z.number().default(0),

    lessons: z.array(z.string()).default([])
  })
})

const lesson = defineCollection({
  type: 'page',

  source: 'lesson/**/*.md',

  schema: z.object({
    slug: z.string(),

    title: z.string(),

    description: z.string(),

    order: z.number().optional()
  })
})

const exercise = defineCollection({
  type: 'data',

  source: 'exercise/**/*.yml',

  schema: z.object({
    slug: z.string(),

    title: z.string(),

    description: z.string().optional(),

    questions: z.array(z.unknown()).default([])
  })
})

export default defineContentConfig({
  collections: {
    chapter,

    lesson,

    exercise
  }
})
