/**
 * 章节仓库 - 负责查询 Nuxt Content 章节数据
 * 注意：此文件仅供服务端使用（API端点），客户端通过 API 获取数据
 */

import { queryCollection } from '@nuxt/content/server'

export const chapterRepository = {
  /**
   * 获取课程的所有章节
   * @param {H3Event} event - 请求事件
   * @param {string} courseSlug - 课程标识
   */
  async findAllByCourse(event, courseSlug) {
    return await queryCollection(event, 'chapters')
      .where('course', '=', courseSlug)
      .sort({ order: 1 })
      .all()
  },

  /**
   * 根据课程和章节 slug 获取章节详情
   * @param {H3Event} event - 请求事件
   * @param {string} courseSlug - 课程标识
   * @param {string} chapterSlug - 章节标识
   */
  async findBySlug(event, courseSlug, chapterSlug) {
    return await queryCollection(event, 'chapters')
      .where('course', '=', courseSlug)
      .where({ _partial: { slug: chapterSlug } })
      .first()
  }
}
