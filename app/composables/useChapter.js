import { ChapterRepository } from '~/repositories/ChapterRepository'

import { ref } from 'vue'

export function useChapter() {
  const chapters = ref([])

  const currentChapter = ref(null)

  const loadChapters = async () => {
    try {
      chapters.value = await ChapterRepository.findAll()
    } finally {
    }
  }

  const loadChapter = async slug => {
    try {
      currentChapter.value = await ChapterRepository.findBySlug(slug)
    } finally {
    }
  }

  return {
    chapters,

    currentChapter,

    loadChapters,

    loadChapter
  }
}
