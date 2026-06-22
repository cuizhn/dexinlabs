/**
 * 课程 Repository
 * 职责：仅负责查询 Content 数据源
 */
import { queryCollection } from '@nuxt/content/server'

export const courseRepository = {
  /**
   * 获取所有课程
   */
  async findAll() {
    const docs = await queryCollection('courses').all()
    return docs.map(doc => ({
      id: doc.id,
      slug: doc.slug || doc.path?.split('/').pop() || '',
      title: doc.title || '',
      description: doc.description || '',
      icon: doc.icon || '📚',
      difficulty: doc.difficulty || 'beginner',
      order: doc.order ?? 0,
      chapters: [],
    })).sort((a, b) => a.order - b.order)
  },

  /**
   * 根据 slug 获取单个课程
   */
  async findBySlug(slug) {
    const doc = await queryCollection('courses')
      .where('slug', '=', slug)
      .first()
    if (!doc) return null
    return {
      id: doc.id,
      slug: doc.slug || slug,
      title: doc.title || '',
      description: doc.description || '',
      icon: doc.icon || '📚',
      difficulty: doc.difficulty || 'beginner',
      order: doc.order ?? 0,
    }
  },
}
