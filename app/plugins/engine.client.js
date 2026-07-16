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
} from '@content'
import {
  getEngine as getMarkdownEngine,
  renderToHTML
} from '@markdown'

export default defineNuxtPlugin(async () => {
  await import('@database').catch(() => {})

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
      renderToHTML
    }
  }
})
