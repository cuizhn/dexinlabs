/**
 * GET /api/topics/:slug - 根据 slug 获取知识主题详情（含课时列表、前后主题导航）
 */
import { topicService } from '@content'
import { createSlugHandler } from '@server/utils/createSlugHandler'

export default createSlugHandler('主题', slug => topicService.getTopicPage(slug))
