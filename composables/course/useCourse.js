export function useCourse() {

  async function getAllCourses() {
    return await $fetch('/api/courses')
  }

  return {
    getAllCourses
  }
}