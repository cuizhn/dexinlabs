import {
  chapterRepository,
  lessonRepository,
  exerciseRepository
} from '@core/database/repositories'
import type { ChapterRepository, ChapterListByCourseRow } from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { ExerciseRepository, ExerciseListByChapterRow } from '@core/database/repositories'
import type { Chapter, Lesson, Exercise } from '../models/index'
import { queries } from '../queries/index'

type SelectChapter = Chapter
type SelectLesson = Lesson
type SelectExercise = Exercise

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
    const q = queries.normalizeListChapters(courseSlug || {})
    if (!courseSlug) return this.chapters.list()
    return this.chapters.listByCourse(q.courseSlug || courseSlug)
  }

  async getBySlug(slug: string): Promise<ChapterWithRelations | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    const chapter = await this.chapters.getBySlug(q.slug)
    if (!chapter) return null
    const lessons = await this.lessons.listByChapter(q.slug)
    const exercise = await this.exercises.getOneByChapter(q.slug)
    return {
      chapter,
      lessons,
      exercise: exercise || null
    }
  }
}

export const chapterService = new ChapterService()
export default chapterService
