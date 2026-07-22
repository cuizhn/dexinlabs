export interface LastLesson {
  topicSlug: string
  topicTitle: string
  lessonSlug: string
  lessonTitle: string
  lessonIndex: number
  totalLessons: number
}

export interface LearningProgress {
  lastLesson: LastLesson | null
  completedLessons: string[]
  streak: {
    days: number
    lastStudyDate: string
  }
  firstVisitAt: string
}