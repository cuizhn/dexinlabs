import type { Chapter, ChapterListItem } from '~/repositories/ChapterRepository'
import { ChapterRepository } from '~/repositories/ChapterRepository'
import { ref } from 'vue'

export function useChapter() {
  const chapters = ref<ChapterListItem[]>([])
  const currentChapter = ref<Chapter | null>(null)
  const loading = ref(false)

  const loadChapters = async (courseSlug?: string): Promise<void> => {
    loading.value = true
    try {
      chapters.value = await ChapterRepository.findAll(courseSlug)
    } finally {
      loading.value = false
    }
  }

  const loadChapter = async (slug: string): Promise<void> => {
    loading.value = true
    try {
      currentChapter.value = await ChapterRepository.findBySlug(slug)
    } finally {
      loading.value = false
    }
  }

  return {
    chapters,
    currentChapter,
    loading,
    loadChapters,
    loadChapter,
  }
}
