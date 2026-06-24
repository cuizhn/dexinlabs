export class CourseRepository {

  async getCourses() {
    return await $fetch('/api/courses')
  }

}