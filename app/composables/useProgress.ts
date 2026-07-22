import { ProgressService } from '@progress'
import { LocalStorageAdapter } from '@progress/storage/LocalStorageAdapter'
import type { LastLesson } from '@progress/types'

export function useProgress() {
  const service = new ProgressService(new LocalStorageAdapter())
  return {
    isFirstVisit: () => service.isFirstVisit(),
    lastLesson: service.getLastLesson(),
    recordLessonVisit: (lesson: LastLesson) => service.recordLessonVisit(lesson),
    completeLesson: (slug: string) => service.completeLesson(slug),
    isLessonCompleted: (slug: string) => service.isLessonCompleted(slug),
    streakDays: service.getStreakDays()
  }
}