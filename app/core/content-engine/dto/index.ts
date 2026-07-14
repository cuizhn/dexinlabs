import type { Course, Chapter, Lesson, Exercise } from '../models/index'

export interface LessonPage {
  lesson: Lesson
  chapter: Chapter | null
  course: Course | null
  previousLesson: Lesson | null
  nextLesson: Lesson | null
}

export interface ChapterPage {
  chapter: Chapter
  course: Course | null
  lessons: Lesson[]
  exercise: Exercise | null
  previousChapter: Chapter | null
  nextChapter: Chapter | null
}

export interface CoursePage {
  course: Course
  chapters: Chapter[]
}