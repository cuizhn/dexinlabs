import {
  courseRepository,
  chapterRepository,
  lessonRepository
} from '@database/repositories'
import type { ChapterListByCourseRow } from '@database/repositories'
import type { LessonListByChapterRow } from '@database/repositories'
import type { Course, Chapter, Lesson } from '../models/index'
import { queries } from '../queries/index'

interface ChapterWithLessons extends ChapterListByCourseRow {
  lessons: (LessonListByChapterRow & { [key: string]: unknown })[]
}

type CourseWithChapters = Course & {
  chapters: ChapterWithLessons[]
}

export class CourseService {
  async list(): Promise<Course[]> {
    return courseRepository.list()
  }

  async getDefault(): Promise<CourseWithChapters | null> {
    const course = await courseRepository.getDefault()
    if (!course) return null
    
    const chapters = await chapterRepository.listByCourse(course.slug)
    const chaptersAggregated: ChapterWithLessons[] = []
    
    for (const chapter of chapters) {
      const lessons = await lessonRepository.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons: lessons as unknown as ChapterWithLessons['lessons'] })
    }
    
    return { ...course, chapters: chaptersAggregated } as unknown as CourseWithChapters
  }

  async getBySlug(slug: string): Promise<CourseWithChapters | null> {
    const q = queries.normalizeBySlug(slug)
    if (!q.isValid) return null
    
    const course = await courseRepository.getBySlug(q.slug)
    if (!course) return null
    
    const chapters = await chapterRepository.listByCourse(course.slug)
    const chaptersAggregated: ChapterWithLessons[] = []
    
    for (const chapter of chapters) {
      const lessons = await lessonRepository.listByChapter(chapter.slug)
      chaptersAggregated.push({ ...chapter, lessons: lessons as unknown as ChapterWithLessons['lessons'] })
    }
    
    return { ...course, chapters: chaptersAggregated } as unknown as CourseWithChapters
  }

  async getCoursePage(slug: string): Promise<{
    course: Course
    chapters: ChapterWithLessons[]
  } | null> {
    return this.getBySlug(slug) as unknown as { course: Course; chapters: ChapterWithLessons[] } | null
  }
}

export const courseService = new CourseService()
export default courseService
