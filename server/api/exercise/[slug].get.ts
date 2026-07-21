/**
 * GET /api/exercise/:slug - 根据 slug 获取练习详情
 */
import { exerciseService } from '@content'
import { createSlugHandler } from '@server/utils/createSlugHandler'

export default createSlugHandler('练习', slug => exerciseService.getBySlug(slug))
