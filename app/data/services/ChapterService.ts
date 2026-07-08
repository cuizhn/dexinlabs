import {
  chapterRepository,
  lessonRepository,
  exerciseRepository
} from '../repositories/index.js'
import type { ChapterRepository, ChapterListByCourseRow } from '../repositories/index.js'
import type { LessonRepository, LessonListByChapterRow } from '../repositories/index.js'
import type { ExerciseRepository, ExerciseListByChapterRow } from '../repositories/index.js'
import { chapters, lessons, exercises } from '~~/drizzle/db'

type SelectChapter = typeof chapters.$inferSelect
type SelectLesson = typeof lessons.$inferSelect
type SelectExercise = typeof exercises.$inferSelect

export interface ChapterWithRelations {
  chapter: SelectChapter
  lessons: LessonListByChapterRow[]
  exercise: ExerciseListByChapterRow | null
}

export interface ChapterServiceDeps {
  chapters?: ChapterRepository
  lessons?: LessonRepository
  exercises?: ExerciseRepository
}

export class ChapterService {
  chapters: ChapterRepository
  lessons: LessonRepository
  exercises: ExerciseRepository

  constructor({
    chapters = chapterRepository,
    lessons = lessonRepository,
    exercises = exerciseRepository
  }: ChapterServiceDeps = {}) {
    this.chapters = chapters
    this.lessons = lessons
    this.exercises = exercises
  }

  async list(courseSlug?: string): Promise<ChapterListByCourseRow[] | SelectChapter[]> {
    if (!courseSlug) return this.chapters.list()
    return this.chapters.listByCourse(courseSlug)
  }

  async getBySlug(slug: string): Promise<ChapterWithRelations | null> {
    const chapter = await this.chapters.getBySlug(slug)
    if (!chapter) return null
    const lessons = await this.lessons.listByChapter(slug)
    const exercise = await this.exercises.getOneByChapter(slug)
    return {
      chapter,
      lessons,
      exercise: exercise || null
    }
  }
}

export const chapterService = new ChapterService()
export default chapterService
