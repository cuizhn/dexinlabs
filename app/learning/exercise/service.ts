/**
 * 练习服务 - 封装练习相关的业务逻辑
 *
 * 提供练习列表、练习页面数据组装等功能。
 *
 * 架构 V4：Exercise 通过 topicId 关联 Topic
 */
import { exerciseRepository } from './repository'
import { topicRepository } from '../topic/repository'
import type { ExercisePage } from '../../types/pages'
import { normalizeSlug } from '../shared'
import { toExercise } from './types'
import { toTopic } from '../topic/types'

export class ExerciseService {
  async list() {
    return exerciseRepository.list()
  }

  async listByTopic(topicSlug: string) {
    return exerciseRepository.listByTopic(topicSlug)
  }

  async getExercisePage(topicSlug: string): Promise<ExercisePage | null> {
    const cleanTopic = normalizeSlug(topicSlug)
    if (!cleanTopic) return null

    const topicRow = await topicRepository.findBySlug(cleanTopic)
    if (!topicRow) return null

    const exerciseList = await exerciseRepository.listByTopic(cleanTopic)
    if (!exerciseList.length) return null

    return {
      exercise: toExercise(exerciseList[0] as Record<string, unknown>),
      topicTitle: toTopic(topicRow as Record<string, unknown>).title
    }
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
