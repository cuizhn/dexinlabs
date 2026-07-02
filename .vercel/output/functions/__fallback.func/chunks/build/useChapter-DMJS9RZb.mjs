import { ref } from 'vue';

const ChapterRepository = {
  // 异步方法：查询所有章节列表，支持按课程过滤
  // 流程步骤：
  //   1. 初始化空的查询参数对象 params
  //   2. 若传入 courseSlug，则将其作为 course 查询参数
  //   3. 调用 $fetch 发起 GET 请求获取数据
  //   4. 捕获请求异常，异常时返回空数组降级
  // API 地址：GET /api/chapter
  // query params 结构：{ course?: string }，course 为课程 slug，用于筛选该课程下的章节
  // 返回 Promise<ChapterListItem[]>：成功返回章节列表数组，失败返回空数组
  async findAll() {
    try {
      const params = {};
      return await $fetch("/api/chapter", { params });
    } catch {
      return [];
    }
  },
  // 异步方法：根据章节 slug 查询单个章节的完整详情（包含 lessons 和 exercise）
  // 流程步骤：
  //   1. 直接调用 $fetch 发起 GET 请求，slug 作为路径参数
  //   2. 捕获请求异常，异常时返回 null 降级
  // API 地址：GET /api/chapter/{slug}，slug 为 URL 路径参数
  // query params 结构：无额外查询参数
  // 返回 Promise<Chapter | null>：成功返回 Chapter 完整对象，失败返回 null
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
    // 章节列表响应式变量
    chapters,
    // 当前章节详情响应式变量
    currentChapter,
    // 加载章节列表方法
    loadChapters,
    // 加载单个章节方法
    loadChapter
  };
}

export { useChapter as u };
//# sourceMappingURL=useChapter-DMJS9RZb.mjs.map
