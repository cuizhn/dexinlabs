/**
 * 章节 Repository
 * 职责：仅负责查询 Content 数据源
 */
import { queryCollection } from '@nuxt/content/server'

export const chapterRepository = {
  /**
   * 获取课程的所有章节（不含 _course.yml）
   */
  async findByCourse(courseSlug) {
    const docs = await queryCollection('chapters').all()
    return docs
      .filter(doc => doc.path?.startsWith(`/courses/${courseSlug}/`))
      .map(doc => ({
        slug: doc.slug || doc.path?.split('/').pop() || '',
        title: doc.title || '',
        order: doc.order ?? 0,
        path: doc.path,
      }))
      .sort((a, b) => a.order - b.order)
  },

  /**
   * 获取单个章节内容
   */
  async findBySlug(courseSlug, chapterSlug) {
    const doc = await queryCollection('chapters')
      .path(`/courses/${courseSlug}/${chapterSlug}`)
      .first()
    if (!doc) return null
    return {
      slug: doc.slug || chapterSlug,
      title: doc.title || '',
      description: doc.description || '',
      content: doc.body,
      meta: doc.meta ?? {},
      path: doc.path,
    }
  },

  /**
   * 获取章节导航（上一章/下一章）
   */
  async findNavigation(courseSlug, chapterSlug) {
    const chapters = await this.findByCourse(courseSlug)
    const index = chapters.findIndex(ch => ch.slug === chapterSlug)
    return {
      prev: index > 0 ? chapters[index - 1] : null,
      next: index < chapters.length - 1 ? chapters[index + 1] : null,
    }
  },
}
