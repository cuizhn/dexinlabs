/**
 * 学习进度服务 - 封装学习进度相关的业务逻辑
 *
 * 通过依赖注入的 Storage Adapter 持久化学习进度。
 * MVP 使用 LocalStorage，未来可无缝切换云端存储。
 */
import type { LearningProgress, LastLesson } from '../types'
import type { ProgressStorage } from '../repository/progress'

export class ProgressService {
  constructor(private storage: ProgressStorage) {}

  isFirstVisit(): boolean {
    return this.storage.get() === null
  }

  getLastLesson() {
    return this.storage.get()?.lastLesson ?? null
  }

  recordLessonVisit(lesson: LastLesson): void {
    const progress = this.getOrCreate()
    progress.lastLesson = lesson
    this.updateStreak(progress)
    this.storage.save(progress)
  }

  completeLesson(lessonSlug: string): void {
    const progress = this.getOrCreate()
    if (!progress.completedLessons.includes(lessonSlug)) {
      progress.completedLessons.push(lessonSlug)
      this.storage.save(progress)
    }
  }

  isLessonCompleted(lessonSlug: string): boolean {
    return this.storage.get()?.completedLessons.includes(lessonSlug) ?? false
  }

  getStreakDays(): number {
    return this.storage.get()?.streak.days ?? 0
  }

  private getOrCreate(): LearningProgress {
    return this.storage.get() ?? {
      lastLesson: null,
      completedLessons: [],
      streak: { days: 0, lastStudyDate: '' },
      firstVisitAt: new Date().toISOString()
    }
  }

  private updateStreak(progress: LearningProgress): void {
    const today = new Date().toISOString().slice(0, 10)
    const lastDate = progress.streak.lastStudyDate
    if (lastDate === today) return
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    progress.streak.days = lastDate === yesterday ? progress.streak.days + 1 : 1
    progress.streak.lastStudyDate = today
  }
}
