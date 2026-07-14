import {
  courseRepository,
  chapterRepository,
  lessonRepository,
  exerciseRepository
} from '@core/database/repositories'
import type { CourseRepository, ChapterRepository, LessonRepository, ExerciseRepository } from '@core/database/repositories'
import type { ContentSource } from './types'
import type { Course, Chapter, Lesson, Exercise } from '../models/index'
import type { LessonPage, ChapterPage, CoursePage } from '../dto/index'
import { courseService, chapterService, lessonService } from '../services/index'

export interface DatabaseSourceDeps {
  courses?: CourseRepository
  chapters?: ChapterRepository
  lessons?: LessonRepository
  exercises?: ExerciseRepository
}

export class DatabaseSource implements ContentSource {
  private courses: CourseRepository
  private chapters: ChapterRepository
  private lessons: LessonRepository
  private exercises: ExerciseRepository

  constructor({
    courses = courseRepository,
    chapters = chapterRepository,
    lessons = lessonRepository,
    exercises = exerciseRepository
  }: DatabaseSourceDeps = {}) {
    this.courses = courses
    this.chapters = chapters
    this.lessons = lessons
    this.exercises = exerciseRepository
  }

  async getCourse(slug: string): Promise<Course | null> {
    const course = await this.courses.getBySlug(slug)
    if (!course) return null
    const chapters = await this.chapters.listByCourse(slug)
    const chaptersWithLessons: Chapter[] = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      chaptersWithLessons.push({ ...chapter, lessons } as unknown as Chapter)
    }
    return { ...course, chapters: chaptersWithLessons } as unknown as Course
  }

  async getChapter(slug: string): Promise<Chapter | null> {
    const chapter = await this.chapters.getBySlug(slug)
    if (!chapter) return null
    const lessons = await this.lessons.listByChapter(slug)
    const exercise = await this.exercises.getOneByChapter(slug)
    return {
      ...chapter,
      lessons: lessons as unknown as Lesson[],
      exercises: exercise ? [exercise] : []
    } as unknown as Chapter
  }

  async getLesson(slug: string): Promise<Lesson | null> {
    return this.lessons.getBySlug(slug) as unknown as Promise<Lesson | null>
  }

  async getExercise(slug: string): Promise<Exercise | null> {
    return this.exercises.getBySlug(slug) as unknown as Promise<Exercise | null>
  }

  async listCourses(): Promise<Course[]> {
    const courses = await this.courses.list()
    const result: Course[] = []
    for (const course of courses) {
      const chapters = await this.chapters.listByCourse(course.slug)
      const chaptersWithLessons: Chapter[] = []
      for (const chapter of chapters) {
        const lessons = await this.lessons.listByChapter(chapter.slug)
        chaptersWithLessons.push({ ...chapter, lessons } as unknown as Chapter)
      }
      result.push({ ...course, chapters: chaptersWithLessons } as unknown as Course)
    }
    return result
  }

  async listChapters(courseSlug?: string): Promise<Chapter[]> {
    if (!courseSlug) return []
    const chapters = await this.chapters.listByCourse(courseSlug)
    const result: Chapter[] = []
    for (const chapter of chapters) {
      const lessons = await this.lessons.listByChapter(chapter.slug)
      result.push({ ...chapter, lessons } as unknown as Chapter)
    }
    return result
  }

  async listLessons(chapterSlug?: string): Promise<Lesson[]> {
    if (!chapterSlug) return []
    return this.lessons.listByChapter(chapterSlug) as unknown as Promise<Lesson[]>
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