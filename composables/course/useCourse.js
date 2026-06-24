import { CourseRepository } from '~/repositories/courseRepository'

export function useCourse() {

  const repo = new CourseRepository()

  const courses = ref([])
  const loading = ref(false)

  const loadCourses = async () => {
    loading.value = true
    courses.value = await repo.getCourses()
    loading.value = false
  }

  return {
    courses,
    loading,
    loadCourses
  }
}