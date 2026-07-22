/**
 * GET /api/domains - 获取知识领域信息
 *
 * 支持 ?slug=xxx 查询指定领域，无参数时返回全部领域列表。
 */
import { defineEventHandler, getQuery, createError } from 'h3'
import { domainService } from '@content'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const slug = typeof query.slug === 'string' ? query.slug : ''

  if (slug) {
    const result = await domainService.getDomainPage(slug)
    if (!result) {
      throw createError({ statusCode: 404, statusMessage: `未找到领域：${slug}` })
    }
    return result
  }

  // 无 slug 参数时返回全部领域列表（知识地图页使用）
  return domainService.listAllWithTopics()
})
