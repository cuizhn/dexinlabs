/**
 * 练习服务 - 封装练习相关的业务逻辑
 *
 * Service 只负责业务数据组装，不做 Markdown 渲染。
 * 内容渲染由 Renderer 基于 Exercise AST 驱动（Block → Vue Component）。
 */
import { exerciseRepository, topicRepository } from '@content/repositories'
import type { Exercise, ExercisePage } from '../types/index'
import { normalizeSlug, toExercise, toTopic } from '../utils'

export class ExerciseService {
  async listByTopicWithMeta(topicSlug: string): Promise<{ exercises: Exercise[], topicTitle: string }> {
    const clean = normalizeSlug(topicSlug)
    if (!clean) return { exercises: [], topicTitle: '' }

    const [exercises, topicData] = await Promise.all([
      exerciseRepository.listByTopic(clean),
      topicRepository.findBySlug(clean)
    ])

    return { exercises, topicTitle: topicData ? toTopic(topicData).title : '' }
  }

  /**
   * 获取练习页面数据：取第一道题
   *
   * Repository 的 ensureAST 已确保 exercise.content 为 AST 格式。
   */
  async getExercisePage(topicSlug: string): Promise<ExercisePage> {
    const clean = normalizeSlug(topicSlug)
    if (!clean) return { exercise: null, topicTitle: '' }

    const [exercises, topicData] = await Promise.all([
      exerciseRepository.listByTopic(clean),
      topicRepository.findBySlug(clean)
    ])

    const topicTitle = topicData ? toTopic(topicData).title : ''

    if (!exercises.length) {
      return { exercise: null, topicTitle }
    }

    return {
      exercise: toExercise(exercises[0]!),
      topicTitle
    }
  }

  async listAll(): Promise<Exercise[]> {
    return exerciseRepository.list()
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
