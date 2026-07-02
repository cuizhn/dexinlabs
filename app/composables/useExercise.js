import { ExerciseRepository } from '~/repositories/ExerciseRepository'

import { ref } from 'vue'

export function useExercise() {
  const exercise = ref(null)

  const loading = ref(false)

  const loadExercise = async slug => {
    loading.value = true
    try {
      exercise.value = await ExerciseRepository.findBySlug(slug)
    } finally {
      loading.value = false
    }
  }

  return {
    exercise,
    loading,
    loadExercise
  }
}
