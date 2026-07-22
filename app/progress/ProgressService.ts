import type { LearningProgress, LastLesson } from './models'
import type { ProgressStorage } from './storage/types'

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