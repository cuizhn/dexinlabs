/**
 * GET /api/chapter/:slug - 根据 slug 获取章节详情（含课时列表、前后章节导航）
 */
import { chapterService } from '@content'
import { createSlugHandler } from '@server/utils/createSlugHandler'

export default createSlugHandler('章节', slug => chapterService.getChapterPage(slug))
