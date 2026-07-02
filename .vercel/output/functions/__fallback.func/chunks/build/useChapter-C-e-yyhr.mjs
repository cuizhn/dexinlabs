import { ref } from 'vue';

const ChapterRepository = {
  async findAll() {
    try {
      const params = {};
      return await $fetch("/api/chapter", { params });
    } catch {
      return [];
    }
  },
  async findBySlug(slug) {
    try {
      return await $fetch(`/api/chapter/${slug}`);
    } catch {
      return null;
    }
  }
};
function useChapter() {
  const chapters = ref([]);
  const currentChapter = ref(null);
  const loadChapters = async () => {
    try {
      chapters.value = await ChapterRepository.findAll();
    } finally {
    }
  };
  const loadChapter = async (slug) => {
    try {
      currentChapter.value = await ChapterRepository.findBySlug(slug);
    } finally {
    }
  };
  return {
    chapters,
    currentChapter,
    loadChapters,
    loadChapter
  };
}

export { useChapter as u };
//# sourceMappingURL=useChapter-C-e-yyhr.mjs.map
