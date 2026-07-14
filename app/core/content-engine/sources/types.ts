import type { Course, Chapter, Lesson, Exercise } from '../models/index'
import type { LessonPage, ChapterPage, CoursePage } from '../dto/index'

export interface ContentSource {
  getCourse(slug: string): Promise<Course | null>
  getChapter(slug: string): Promise<Chapter | null>
  getLesson(slug: string): Promise<Lesson | null>
  getExercise(slug: string): Promise<Exercise | null>
  listCourses(): Promise<Course[]>
  listChapters(courseSlug?: string): Promise<Chapter[]>
  listLessons(chapterSlug?: string): Promise<Lesson[]>
  getLessonPage(slug: string): Promise<LessonPage | null>
  getChapterPage(slug: string): Promise<ChapterPage | null>
  getCoursePage(slug: string): Promise<CoursePage | null>
  getDefaultCourse(): Promise<CoursePage | null>
}

export type SourceType = 'file' | 'database'