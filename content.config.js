import { defineContentConfig, defineCollection, z } from '@nuxt/content'
const course = defineCollection({
  type: 'data',
  source: 'course/**/*.yml',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
  })
  })

const chapter = defineCollection({
  type: 'data',
  source: 'chapter/**/*.yml',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    course: z.string(),
    title: z.string(),
    order: z.number().default(0),
  })
})

const lesson = defineCollection({
  type: 'page',
  source: 'lesson/**/*.md',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
    chapter: z.string(),
    order: z.number().optional()
  })
})




export default defineContentConfig({
  collections: {
    course,
    chapter,
    lesson,
    //exercise
  }
})
