import type { LearningProgress } from '../models'
import type { ProgressStorage } from './types'

export class LocalStorageAdapter implements ProgressStorage {
  private readonly key = 'dexinlabs_progress'

  get(): LearningProgress | null {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(this.key)
    return raw ? JSON.parse(raw) : null
  }

  save(progress: LearningProgress): void {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(this.key, JSON.stringify(progress))
  }

  clear(): void {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(this.key)
  }
}