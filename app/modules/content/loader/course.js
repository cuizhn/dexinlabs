import { courseService } from '../services/CourseService.js'

export async function loadCourse(slug = null, opts = {}) {
  const { source } = opts
  const course = slug
    ? await courseService.getBySlug(slug)
    : await courseService.getDefault()

  if (!course) return null

  const lessonsMap = {}
  const chapters = course.chapters || []
  for (const ch of chapters) {
    lessonsMap[ch.slug] = ch.lessons || []
  }

  return {
    ...course,
    chapters,
    lessonsMap,
    __loadedBy: 'content-loader/course',
    __source: source?.name || null
  }
}

export async function listCourses() {
  return courseService.list()
}

export default { loadCourse, listCourses }
