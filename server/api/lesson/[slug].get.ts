/**
 * GET /api/lesson/:slug - 根据 slug 获取课时详情（含渲染后的 HTML）
 */
import { lessonService } from '@content'
import { createSlugHandler } from '@server/utils/createSlugHandler'

export default createSlugHandler('课时', slug => lessonService.getLessonPage(slug))
