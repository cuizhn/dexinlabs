import { courseService } from '@data/services'
import type { Course, Chapter, Lesson, LoaderOptions } from '@core/contracts/Loader'

interface CourseLoaderSource {
  name?: string
  [key: string]: unknown
}

interface CourseLoadOptions extends LoaderOptions {
  source?: CourseLoaderSource
}

interface LoadedCourse extends Course {
  chapters: Chapter[]
  lessonsMap: Record<string, Lesson[]>
  __loadedBy: string
  __source: string | null
}

export async function loadCourse(
  slug: string | null = null,
  opts: CourseLoadOptions = {}
): Promise<LoadedCourse | null> {
  const { source } = opts
  const course = slug
    ? await courseService.getBySlug(slug)
    : await courseService.getDefault()

  if (!course) return null

  const lessonsMap: Record<string, Lesson[]> = {}
  const chapters: Chapter[] = (course.chapters || []) as unknown as Chapter[]
  for (const ch of chapters) {
    lessonsMap[ch.slug] = (ch.lessons as Lesson[]) || []
  }

  return {
    ...(course as unknown as Course),
    chapters,
    lessonsMap,
    __loadedBy: 'content-loader/course',
    __source: source?.name || null
  }
}

export async function listCourses(): Promise<Course[]> {
  return courseService.list() as Promise<Course[]>
}

export default { loadCourse, listCourses }
