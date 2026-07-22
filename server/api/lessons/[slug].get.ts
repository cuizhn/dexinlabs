/**
 * GET /api/lessons/:slug - 根据 slug 获取课时详情（含内容渲染、前后课时导航）
 */
import { lessonService } from '@content'
import { createSlugHandler } from '@server/utils/createSlugHandler'

export default createSlugHandler('课时', slug => lessonService.getLessonPage(slug))
