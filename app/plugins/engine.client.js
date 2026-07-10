import { defineNuxtPlugin } from '#imports'
import {
  getContentEngine,
  chapterService,
  lessonService,
  courseService,
  exerciseService,
  chapterRepository,
  lessonRepository,
  courseRepository,
  exerciseRepository,
  assetRepository,
  queries
} from '@ce'
import {
  getEngine as getMarkdownEngine,
  renderToHTML,
  renderToVNode
} from '@me'

export default defineNuxtPlugin(async () => {
  await import('@core/database').catch(() => {})
  const content = getContentEngine()
  const markdown = getMarkdownEngine()
  const services = {
    chapter: chapterService,
    lesson: lessonService,
    course: courseService,
    exercise: exerciseService
  }
  const repositories = {
    chapter: chapterRepository,
    lesson: lessonRepository,
    course: courseRepository,
    exercise: exerciseRepository,
    asset: assetRepository
  }
  return {
    provide: {
      content,
      markdown,
      services,
      repositories,
      queries,
      renderToHTML,
      renderToVNode
    }
  }
})
