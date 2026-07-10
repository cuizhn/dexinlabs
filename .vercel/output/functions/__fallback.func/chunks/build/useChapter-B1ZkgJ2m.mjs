import { computed } from 'vue';
import { u as useAsyncData } from './server.mjs';

async function useChapter(slugOrOpts = null, opts = {}) {
  var _a, _b;
  const isList = slugOrOpts === null || typeof slugOrOpts === "object";
  const options = isList ? slugOrOpts || {} : opts;
  if (isList) {
    const course = options.course || null;
    const key2 = `chapters:list:${course || "all"}`;
    const { data: data2, pending: pending2, error: error2, refresh: refresh2 } = await useAsyncData(
      key2,
      () => $fetch("/api/chapter", { params: course ? { course } : {} }),
      {
        default: () => [],
        server: true,
        lazy: (_a = options.lazy) != null ? _a : false,
        ...options
      }
    );
    return {
      chapters: data2,
      loading: pending2,
      error: error2,
      refresh: refresh2
    };
  }
  const slug = slugOrOpts;
  const key = `chapter:${slug}`;
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch(`/api/chapter/${slug}`),
    {
      default: () => ({ chapter: null, exercise: null }),
      server: true,
      lazy: (_b = options.lazy) != null ? _b : false,
      ...options
    }
  );
  const currentChapter = computed(() => {
    var _a2, _b2;
    return (_b2 = (_a2 = data.value) == null ? void 0 : _a2.chapter) != null ? _b2 : null;
  });
  const currentExercise = computed(() => {
    var _a2, _b2;
    return (_b2 = (_a2 = data.value) == null ? void 0 : _a2.exercise) != null ? _b2 : null;
  });
  return {
    data,
    currentChapter,
    currentExercise,
    loading: pending,
    error,
    refresh
  };
}

export { useChapter as u };
//# sourceMappingURL=useChapter-B1ZkgJ2m.mjs.map
