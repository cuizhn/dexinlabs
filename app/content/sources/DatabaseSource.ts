import {
  courseRepository,
  chapterRepository,
  lessonRepository,
  exerciseRepository
} from '@database/repositories'
import type { ContentSource } from './types'
import type { Course, Chapter, Lesson, Exercise, LessonPage, ChapterPage, CoursePage } from '../models/index'
import { courseService, chapterService, lessonService } from '../services/index'

export class DatabaseSource implements ContentSource {
  async getCourse(slug: string): Promise<Course | null> {
    const course = await courseRepository.getBySlug(slug)
    if (!course) return null

    const chapters = await chapterRepository.listByCourse(slug)
    const chaptersWithLessons: Chapter[] = []
    for (const chapter of chapters) {
      const lessons = await lessonRepository.listByChapter(chapter.slug)
      chaptersWithLessons.push({ ...chapter, lessons } as unknown as Chapter)
    }

    return { ...course, chapters: chaptersWithLessons } as unknown as Course
  }

  async getChapter(slug: string): Promise<Chapter | null> {
    const chapter = await chapterRepository.getBySlug(slug)
    if (!chapter) return null

    const lessons = await lessonRepository.listByChapter(slug)
    const exercise = await exerciseRepository.getOneByChapter(slug)

    return {
      ...chapter,
      lessons: lessons as unknown as Lesson[],
      exercises: exercise ? [exercise] : []
    } as unknown as Chapter
  }

  async getLesson(slug: string): Promise<Lesson | null> {
    return lessonRepository.getBySlug(slug) as unknown as Promise<Lesson | null>
  }

  async getExercise(slug: string): Promise<Exercise | null> {
    return exerciseRepository.getBySlug(slug) as unknown as Promise<Exercise | null>
  }

  async listCourses(): Promise<Course[]> {
    const courses = await courseRepository.list()
    const result: Course[] = []

    for (const course of courses) {
      const chapters = await chapterRepository.listByCourse(course.slug)
      const chaptersWithLessons: Chapter[] = []

      for (const chapter of chapters) {
        const lessons = await lessonRepository.listByChapter(chapter.slug)
        chaptersWithLessons.push({ ...chapter, lessons } as unknown as Chapter)
      }

      result.push({ ...course, chapters: chaptersWithLessons } as unknown as Course)
    }

    return result
  }

  async listChapters(courseSlug?: string): Promise<Chapter[]> {
    if (!courseSlug) return []

    const chapters = await chapterRepository.listByCourse(courseSlug)
    const result: Chapter[] = []

    for (const chapter of chapters) {
      const lessons = await lessonRepository.listByChapter(chapter.slug)
      result.push({ ...chapter, lessons } as unknown as Chapter)
    }

    return result
  }

  async listLessons(chapterSlug?: string): Promise<Lesson[]> {
    if (!chapterSlug) return []
    return lessonRepository.listByChapter(chapterSlug) as unknown as Promise<Lesson[]>
  }

  async getLessonPage(slug: string): Promise<LessonPage | null> {
    return lessonService.getLessonPage(slug) as unknown as Promise<LessonPage | null>
  }

  async getChapterPage(slug: string): Promise<ChapterPage | null> {
    return chapterService.getChapterPage(slug) as unknown as Promise<ChapterPage | null>
  }

  async getCoursePage(slug: string): Promise<CoursePage | null> {
    return courseService.getCoursePage(slug) as unknown as Promise<CoursePage | null>
  }

  async getDefaultCourse(): Promise<CoursePage | null> {
    return courseService.getDefault() as unknown as Promise<CoursePage | null>
  }
}
