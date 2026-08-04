/**
 * 练习服务 - 封装练习相关的业务逻辑
 *
 * 提供练习列表、练习页面数据组装（含 Markdown 渲染）等功能。
 * Service 负责将 Markdown 渲染为 HTML 字段（bodyHtml），
 * Composable 层只消费结果，不感知 Markdown。
 */
import { exerciseRepository, topicRepository } from '@content/repositories'
import { renderToHTML } from '@markdown'
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
   * 获取练习页面数据：取第一道题并将 body 渲染为 HTML
   *
   * 与 LessonService.getLessonPage 保持一致，Markdown 渲染在 Service 层完成。
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

    // 取第一道题，渲染 body Markdown → HTML
    const first = exercises[0]!
    const bodyHtml = first.body ? await renderToHTML(first.body) : ''

    return {
      exercise: toExercise(first, { bodyHtml }),
      topicTitle
    }
  }

  async listAll(): Promise<Exercise[]> {
    return exerciseRepository.list()
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService