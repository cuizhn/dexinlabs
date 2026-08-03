import { exerciseRepository, topicRepository } from '@content/repositories'
import type { Exercise } from '../types/index'
import { normalizeSlug, toTopic } from '../utils'

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

  async listAll(): Promise<Exercise[]> {
    return exerciseRepository.list()
  }
}

export const exerciseService = new ExerciseService()
export default exerciseService