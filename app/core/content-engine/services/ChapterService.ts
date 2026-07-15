import {
  chapterRepository,
  lessonRepository,
  exerciseRepository,
  courseRepository
} from '@core/database/repositories'
import type { ChapterRepository, ChapterListByCourseRow } from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { ExerciseRepository, ExerciseListByChapterRow } from '@core/database/repositories'
import type { CourseRepository } from '@core/database/repositories'
import type { Chapter, Lesson, Exercise, Course } from '../models/index'
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
  courses?: CourseRepository
}

export class ChapterService {
  chapters: ChapterRepository
  lessons: LessonRepository
  exercises: ExerciseRepository
  courses: CourseRepository

  constructor({
    chapters = chapterRepository,
    lessons = lessonRepository,
    exercises = exerciseRepository,
    courses = courseRepository
  }: ChapterServiceDeps = {}) {
    this.chapters = chapters
    this.lessons = lessons
    this.exercises = exercises
    this.courses = courses
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

  async listAll(): Promise<SelectChapter[]> {
    return this.chapters.list()
  }

  async getChapterPage(slug: string): Promise<{
    chapter: SelectChapter
    course: Course | null
    lessons: SelectLesson[]
    exercise: SelectExercise | null
    previousChapter: SelectChapter | null
    nextChapter: SelectChapter | null
  } | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null

    const chapter = await this.chapters.getBySlug(q.slug)
    if (!chapter) return null

    let course: Course | null = null
    let previousChapter: SelectChapter | null = null
    let nextChapter: SelectChapter | null = null

    if (chapter.courseId) {
      course = (await this.courses.getById(chapter.courseId)) || null
    }
    if (!course && chapter.course) {
      course = (await this.courses.getBySlug(chapter.course)) || null
    }

    const lessons = await this.lessons.listByChapter(chapter.slug)
    const exercise = await this.exercises.getOneByChapter(chapter.slug)

    if (course) {
      const chaptersInCourse = await this.chapters.listByCourse(course.slug)
      const currentIndex = chaptersInCourse.findIndex(c => c.slug === chapter.slug)
      if (currentIndex >= 0) {
        if (currentIndex > 0) {
          const prevItem = chaptersInCourse[currentIndex - 1]
          if (prevItem) {
            const prev = await this.chapters.getBySlug(prevItem.slug)
            if (prev) previousChapter = prev
          }
        }
        if (currentIndex < chaptersInCourse.length - 1) {
          const nextItem = chaptersInCourse[currentIndex + 1]
          if (nextItem) {
            const next = await this.chapters.getBySlug(nextItem.slug)
            if (next) nextChapter = next
          }
        }
      }
    }

    return {
      chapter,
      course,
      lessons: lessons as unknown as SelectLesson[],
      exercise: (exercise || null) as unknown as SelectExercise | null,
      previousChapter,
      nextChapter
    }
  }
}

export const chapterService = new ChapterService()
export default chapterService
