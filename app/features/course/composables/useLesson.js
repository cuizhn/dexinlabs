import { lessonRepository } from "~/features/course/repositories/lessonRepository.js";
import { ref } from "vue";

export function useLesson() {
  const repo = lessonRepository;

  const lesson = ref();

  const loading = ref(false);

  const loadLesson = async (slug) => {
    loading.value = true;

    try {
      lesson.value = await repo.getLesson(slug);
    }  finally {
      loading.value = false;
    }
  };

  return {
    lesson,

    loading,

    loadLesson,
  };
}
