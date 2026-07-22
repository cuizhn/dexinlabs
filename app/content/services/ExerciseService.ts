import { exerciseRepository } from '@content/repositories'
import type { Exercise } from '../models/index'
import type { TopicService } from './TopicService'
import { normalizeSlug } from '../utils'

export class ExerciseService {
  constructor(private readonly topicService: TopicService) {}

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

    const [exercises, topicPage] = await Promise.all([
      exerciseRepository.listByTopic(clean),
      this.topicService.getBySlug(clean)
    ])

    return { exercises, topicTitle: topicPage?.topic.title || '' }
  }

  async listAll(): Promise<Exercise[]> {
    return exerciseRepository.list()
  }
}

export const exerciseService = new ExerciseService({
  getBySlug: () => Promise.resolve(null)
} as unknown as TopicService)
export default exerciseService