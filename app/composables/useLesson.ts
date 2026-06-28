import type { Lesson } from '~/repositories/LessonRepository'
import { LessonRepository } from '~/repositories/LessonRepository'
import { ref } from 'vue'

export function useLesson() {
  const lesson = ref<Lesson | null>(null)
  const loading = ref(false)

  const loadLesson = async (slug: string): Promise<void> => {
    loading.value = true
    try {
      lesson.value = await LessonRepository.findBySlug(slug)
    } finally {
      loading.value = false
    }
  }

  return {
    lesson,
    loading,
    loadLesson,
  }
}
