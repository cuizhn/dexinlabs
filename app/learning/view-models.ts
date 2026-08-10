/**
 * 页面视图模型类型
 *
 * 定义各页面组合所需的完整数据结构，
 * 由 API 层返回、Composable 层消费。
 */
import type { Course } from './course/types'
import type { Topic } from './topic/types'
import type { Chapter } from './chapter/types'
import type { Lesson } from './lesson/types'
import type { Exercise } from './exercise/types'

/**
 * LessonPage - 课时页面数据结构
 */
export interface LessonPage {
  lesson: Lesson
  topic: Topic | null
  course: Course | null
  chapter: Chapter | null
  previousLesson: Lesson | null
  nextLesson: Lesson | null
}

/**
 * TopicPage - 知识主题页面数据结构
 *
 * 包含主题下的章节列表（含各章节的课时），
 * 以及不属于任何章节的课时（flatLessons）。
 */
export interface TopicPage {
  topic: Topic
  course: Course | null
  chapters: ChapterWithLessons[]
  lessons: Lesson[]
  exercise: Exercise | null
  previousTopic: Topic | null
  nextTopic: Topic | null
}

/**
 * ChapterWithLessons - 章节及其课时
 */
export interface ChapterWithLessons {
  chapter: Chapter
  lessons: Lesson[]
}

/**
 * CoursePage - 课程页面数据结构
 */
export interface CoursePage {
  course: Course
  topics: Topic[]
}

/**
 * CatalogChapter - 课程目录中的章节（含课时列表）
 */
export interface CatalogChapter {
  chapter: Chapter
  lessons: Lesson[]
}

/**
 * CatalogTopic - 课程目录中的主题（含章节列表）
 */
export interface CatalogTopic {
  topic: Topic
  chapters: CatalogChapter[]
}

/**
 * ExercisePage - 练习页面数据结构
 */
export interface ExercisePage {
  exercise: Exercise | null
  topicTitle: string
}
