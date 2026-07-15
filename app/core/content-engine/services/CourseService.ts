import {
  courseRepository,
  chapterRepository,
  lessonRepository
} from '@core/database/repositories'
import type { CourseRepository } from '@core/database/repositories'
import type { ChapterRepository, ChapterListByCourseRow } from '@core/database/repositories'
import type { LessonRepository, LessonListByChapterRow } from '@core/database/repositories'
import type { Course, Chapter, Lesson } from '../models/index'
import { queries } from '../queries/index'

type SelectCourse = Course
type SelectChapter = Chapter
type SelectLesson = Lesson

interface ChapterWithLessons extends ChapterListByCourseRow {
  lessons: (LessonListByChapterRow & { [key: string]: unknown })[]
}

type CourseWithChapters = SelectCourse & {
  chapters: ChapterWithLessons[]
}

export interface CourseServiceDeps {
  courses?: CourseRepository
  chapters?: ChapterRepository
  lessons?: LessonRepository
}

export class CourseService {
  courses: CourseRepository
  chapters: ChapterRepository
  lessons: LessonRepository

  constructor({ courses = courseRepository, chapters = chapterRepository, lessons = lessonRepository }: CourseServiceDeps = {}) {
    this.courses = courses
    this.chapters = chapters
    this.lessons = lessons
  }

  async list(): Promise<SelectCourse[]> {
    return this.courses.list()
  }

  async getDefault(): Promise<CourseWithChapters | null> {
    const course = await this.courses.getDefault()
    if (!course) return null
    const chapters = await this.chapters.listByCourse(course.slug)
    const chaptersAggregated: ChapterWithLessons[] = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons: lessons as unknown as ChapterWithLessons['lessons'] })
    }
    return { ...course, chapters: chaptersAggregated } as unknown as CourseWithChapters
  }

  async getBySlug(slug: string): Promise<CourseWithChapters | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    const course = await this.courses.getBySlug(q.slug)
    if (!course) return null
    const chapters = await this.chapters.listByCourse(course.slug)
    const chaptersAggregated: ChapterWithLessons[] = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons: lessons as unknown as ChapterWithLessons['lessons'] })
    }
    return { ...course, chapters: chaptersAggregated } as unknown as CourseWithChapters
  }

  async getCoursePage(slug: string): Promise<{
    course: SelectCourse
    chapters: ChapterWithLessons[]
  } | null> {
    return this.getBySlug(slug) as unknown as { course: SelectCourse; chapters: ChapterWithLessons[] } | null
  }
}

export const courseService = new CourseService()
export default courseService
