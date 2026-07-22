import type { LearningProgress } from '../models'

export interface ProgressStorage {
  get(): LearningProgress | null
  save(progress: LearningProgress): void
  clear(): void
}