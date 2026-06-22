/**
 * 章节 Composable
 * 职责：业务逻辑层，调用 Repository
 */
import { chapterRepository } from '~/repositories/chapterRepository'

/**
 * 获取章节详情（含导航和章节列表）
 * 章节阅读页使用
 */
export async function useChapterDetail(courseSlug, chapterSlug) {
  const [chapters, navigation] = await Promise.all([
    chapterRepository.findByCourse(courseSlug),
    chapterRepository.findNavigation(courseSlug, chapterSlug),
  ])

  // 当前章节
  const chapter = chapters.find(ch => ch.slug === chapterSlug) || null

  return {
    chapter,           // 当前章节详情
    chapters,          // 课程所有章节（用于侧边栏）
    prevChapter: navigation.prev,
    nextChapter: navigation.next,
  }
}
