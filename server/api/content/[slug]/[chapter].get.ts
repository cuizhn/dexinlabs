/**
 * 章节内容 API
 *
 * 功能说明：
 * 本文件是 Nuxt Server API 路由处理器，处理章节内容的获取请求。
 * 路由路径：GET /api/content/:slug/:chapter
 * - slug: 课程标识（如 'algebra'）
 * - chapter: 章节标识（如 '01-introduction'）
 *
 * 主要职责：
 * - 从 URL 路径参数中提取课程标识和章节标识
 * - 校验参数完整性（缺少参数返回 400）
 * - 通过 Nuxt Content 查询对应章节的 Markdown 文档
 * - 返回章节内容、标题和元数据
 * - 处理章节不存在（404）和服务器错误（500）的情况
 */

import { defineEventHandler, createError } from "h3";
import { queryCollection } from "@nuxt/content/server";
import { getRouterParam } from "h3";

/**
 * 事件处理器
 * 处理 GET /api/content/:slug/:chapter 请求
 * @param {H3Event} event - H3 请求事件对象
 * @returns {Object} 章节内容对象，包含 content（正文）、title（标题）、meta（元数据）
 * @throws {H3Error} 参数缺失(400)、章节不存在(404)、服务器错误(500)
 */
export default defineEventHandler(async (event) => {
  // 从路由参数中获取课程标识和章节标识
  const slug = getRouterParam(event, 'slug')       // 课程标识，如 'algebra'
  const chapter = getRouterParam(event, 'chapter') // 章节标识，如 '01-introduction'

  // 参数校验：缺少 slug 或 chapter 时返回 400 错误
  if (!slug || !chapter) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing slug or chapter parameter',
    })
  }

  try {
    // 使用 Nuxt Content 的 queryCollection 查询 chapters 集合
    // 按路径精确匹配章节文档，路径格式为 /courses/{slug}/{chapter}
    const doc = await queryCollection(event, 'chapters')
      .path(`/courses/${slug}/${chapter}`)
      .first()

    // 文档不存在时返回 404 错误
    if (!doc) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Chapter not found',
      })
    }

    // 返回章节内容数据
    return {
      content: doc.body || '',     // 章节正文内容（Markdown 渲染后的 HTML）
      title: doc.title || '',      // 章节标题
      meta: doc.meta || {},        // 章节元数据（如描述、关键词等）
    }
  } catch (error) {
    // 如果已经是 H3Error（如上面抛出的 400/404），直接重新抛出
    if (error.statusCode) throw error
    // 其他未知错误，返回 500 服务器内部错误
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch chapter content',
    })
  }
})
