/**
 * 练习服务 - 封装练习相关的业务逻辑
 *
 * 提供练习列表、练习详情、按主题查询练习（含主题标题）等功能。
 */
// 注意：此处直接访问 topicRepository 获取主题标题，
// 避免引入 topicService 的循环依赖。如后续主题服务逻辑变复杂，应改为调用 topicService。
import { exerciseRepository, topicRepository } from '@content/repositories'
import type { Exercise } from '../models/index'
import { normalizeSlug } from '../utils'

export class ExerciseService {
  async listByTopic(topicSlug: string): Promise<Exercise[]> {
    const clean = normalizeSlug(topicSlug)
    if (!clean) return []
    return exerciseRepository.listByTopic(clean)
  }

  async getBySlug(slug: string): Promise<Exercise | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null
    return exerciseRepository.findBySlug(clean)
  }

  async listByTopicWithMeta(topicSlug: string): Promise<{ exercises: Exercise[], topicTitle: string }> {
    const clean = normalizeSlug(topicSlug)
    if (!clean) return { exercises: [], topicTitle: '' }

    const [exercises, topicData] = await Promise.all([
      exerciseRepository.listByTopic(clean),
      topicRepository.findBySlug(clean)
    ])

    return { exercises, topicTitle: topicData?.title || '' }
  }

  async listAll(): Promise<Exercise[]> {
    return exerciseRepository.list()
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
