import { chapterRepository }
    from '~/features/course/repositories/chapterRepository.js'
import { ref } from 'vue'

export function useChapter() {

    const repo = chapterRepository      

    const chapters = ref([])

    const loading = ref(false)

    const loadChapters = async () => {

        loading.value = true

        chapters.value =
            await repo.getChapters()

        loading.value = false
    }

    return {

        chapters,

        loading,

        loadChapters
    }
}