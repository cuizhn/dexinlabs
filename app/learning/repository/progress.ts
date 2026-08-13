/**
 * 学习进度仓储 - LocalStorage 存储 Adapter
 *
 * 实现 ProgressStorage 接口，使用浏览器 LocalStorage 持久化学习进度。
 * 未来可替换为云端存储 Adapter，无需修改 ProgressService。
 */
import type { LearningProgress } from '../types'

/**
 * ProgressStorage - 学习进度存储接口
 *
 * 依赖反转：ProgressService 依赖此接口，而非具体实现。
 */
export interface ProgressStorage {
  get(): LearningProgress | null
  save(progress: LearningProgress): void
  clear(): void
}

/**
 * LocalStorageAdapter - 基于 LocalStorage 的进度存储实现
 */
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

export const progressStorage = new LocalStorageAdapter()
export default progressStorage
