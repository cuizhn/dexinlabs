/**
 * 练习服务 - 封装练习相关的业务逻辑
 *
 * 提供练习列表、练习详情、按章节查询练习（含章节标题）等功能。
 */
// 注意：此处直接访问 chapterRepository 获取章节标题，
// 避免引入 chapterService 的循环依赖。如后续章节服务逻辑变复杂，应改为调用 chapterService。
import { exerciseRepository, chapterRepository } from '@content/repositories'
import type { Exercise } from '../models/index'
import { normalizeSlug } from '../utils'

export class ExerciseService {
  async listByChapter(chapterSlug: string): Promise<Exercise[]> {
    const clean = normalizeSlug(chapterSlug)
    if (!clean) return []
    return exerciseRepository.listByChapter(clean)
  }

  async getBySlug(slug: string): Promise<Exercise | null> {
    const clean = normalizeSlug(slug)
    if (!clean) return null
    return exerciseRepository.getBySlug(clean)
  }

  async listByChapterWithMeta(chapterSlug: string): Promise<{ exercises: Exercise[], chapterTitle: string }> {
    const clean = normalizeSlug(chapterSlug)
    if (!clean) return { exercises: [], chapterTitle: '' }

    const [exercises, chapterData] = await Promise.all([
      exerciseRepository.listByChapter(clean),
      chapterRepository.getBySlug(clean)
    ])

    return { exercises, chapterTitle: chapterData?.title || '' }
  }

  async listAll(): Promise<Exercise[]> {
    return exerciseRepository.list()
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService
