/**
 * 课程仓库 - 负责查询 Nuxt Content 课程数据
 * 注意：此文件仅供服务端使用（API端点），客户端通过 API 获取数据
 */

import { queryCollection } from '@nuxt/content/server'

export const courseRepository = {
  /**
   * 获取所有课程
   * @param {H3Event} event - 请求事件
   */
  async findAll(event) {
    return await queryCollection(event, 'courses').all()
  },

  /**
   * 根据 slug 获取课程
   * @param {H3Event} event - 请求事件
   * @param {string} slug - 课程标识
   */
  async findBySlug(event, slug) {
    const courses = await queryCollection(event, 'courses').all()
    return courses.find(c => c.id === slug) || null
  },

  /**
   * 获取课程的所有章节
   * @param {H3Event} event - 请求事件
   * @param {string} courseSlug - 课程标识
   */
  async getChapters(event, courseSlug) {
    return await queryCollection(event, 'chapters')
      .where('course', '=', courseSlug)
      .sort({ order: 1 })
      .all()
  }
}
