import { ProgressService } from '~/learning/progress'
import { LocalStorageAdapter } from '~/learning/progress/storage/LocalStorageAdapter'
import type { LastLesson } from '~/learning/progress/types'

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