/**
 * useLearningState - 学习状态统一抽象层
 *
 * 所有页面与组件通过此 composable 获取学习状态，不直接读取业务数据。
 * 当前使用 Mock 数据，未来由 Progress Engine 直接替换内部实现。
 *
 * 设计原则：
 * - 页面不写 if (lesson.completed) 这类散落判断
 * - 统一通过 LearningState 驱动显示
 * - 未来 Progress Engine 接管时，只需替换此文件内部逻辑
 */

import { computed } from 'vue'
import { useProgress } from './useProgress'

/**
 * LearningState - 学习状态枚举
 *
 * NOT_STARTED: 待学习（用户尚未接触此内容）
 * IN_PROGRESS: 正在学习（用户已开始但未完成）
 * MASTERED:    已掌握（用户完成学习并通过评估）
 */
export enum LearningState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  MASTERED = 'MASTERED'
}

/** 学习状态的中文标签映射 */
const STATE_LABELS: Record<LearningState, string> = {
  [LearningState.NOT_STARTED]: '待学习',
  [LearningState.IN_PROGRESS]: '正在学习',
  [LearningState.MASTERED]: '已掌握'
}

/**
 * TopicLearningInfo - Topic 级别的学习状态信息
 *
 * 用于知识地图和 Topic 页面展示。
 */
export interface TopicLearningInfo {
  topicSlug: string
  state: LearningState
  /** 已完成课时数 */
  completedCount: number
  /** 总课时数 */
  totalCount: number
}

/**
 * LessonLearningInfo - Lesson 级别的学习状态信息
 *
 * 用于 Lesson 列表和 Checklist 展示。
 */
export interface LessonLearningInfo {
  lessonSlug: string
  isCompleted: boolean
}

/**
 * useLearningState - 获取全局学习状态
 *
 * 返回首页和全局组件所需的统一学习状态数据。
 * 内部委托 useProgress（localStorage），未来替换为 Progress Engine。
 *
 * @returns 学习状态相关的响应式数据和方法
 */
export function useLearningState() {
  const progress = useProgress()

  /** 是否存在任何学习记录 */
  const hasProgress = computed(() => !progress.isFirstVisit())

  /** 当前正在学习的 Topic slug（来自最近学习的 Lesson） */
  const currentTopicSlug = computed(() => progress.lastLesson?.topicSlug ?? null)

  /** 当前正在学习的 Topic 标题 */
  const currentTopicTitle = computed(() => progress.lastLesson?.topicTitle ?? null)

  /** 当前正在学习的 Lesson slug */
  const currentLessonSlug = computed(() => progress.lastLesson?.lessonSlug ?? null)

  /** 当前正在学习的 Lesson 标题 */
  const currentLessonTitle = computed(() => progress.lastLesson?.lessonTitle ?? null)

  /** 最近学习信息（用于首页「继续学习」卡片） */
  const recentLearning = computed(() => {
    const last = progress.lastLesson
    if (!last) return null
    return {
      topicSlug: last.topicSlug,
      topicTitle: last.topicTitle,
      lessonSlug: last.lessonSlug,
      lessonTitle: last.lessonTitle,
      lessonIndex: last.lessonIndex,
      totalLessons: last.totalLessons
    }
  })

  /** 连续学习天数 */
  const streakDays = computed(() => progress.streakDays)

  /**
   * getTopicState - 获取某个 Topic 的学习状态
   *
   * 根据该 Topic 下已完成的课时数判断：
   * - 0 完成 → NOT_STARTED
   * - 部分完成 → IN_PROGRESS
   * - 全部完成 → MASTERED
   *
   * @param topicSlug Topic 的唯一标识
   * @param totalLessons 该 Topic 下的总课时数
   */
  function getTopicState(topicSlug: string, totalLessons: number): TopicLearningInfo {
    // 从 localStorage 中获取已完成课时列表
    // 当前简单实现：检查 completedLessons 中是否有该 topic 下的课时
    // 未来 Progress Engine 会提供更精确的状态
    const allCompleted = progress.isFirstVisit() ? [] : getCompletedLessonsForTopic(topicSlug)
    const completedCount = allCompleted.length

    let state: LearningState
    if (completedCount === 0) {
      state = LearningState.NOT_STARTED
    } else if (completedCount >= totalLessons && totalLessons > 0) {
      state = LearningState.MASTERED
    } else {
      state = LearningState.IN_PROGRESS
    }

    return {
      topicSlug,
      state,
      completedCount,
      totalCount: totalLessons
    }
  }

  /**
   * getLessonState - 获取某个 Lesson 的学习状态
   *
   * @param lessonSlug Lesson 的唯一标识
   */
  function getLessonState(lessonSlug: string): LessonLearningInfo {
    return {
      lessonSlug,
      isCompleted: progress.isLessonCompleted(lessonSlug)
    }
  }

  /**
   * getStateLabel - 获取学习状态的中文标签
   */
  function getStateLabel(state: LearningState): string {
    return STATE_LABELS[state]
  }

  /**
   * recordLesson - 记录一次课时学习
   *
   * 页面在用户进入 Lesson 时调用，更新学习进度。
   */
  function recordLesson(lesson: {
    topicSlug: string
    topicTitle: string
    lessonSlug: string
    lessonTitle: string
    lessonIndex: number
    totalLessons: number
  }) {
    progress.recordLessonVisit(lesson)
  }

  /**
   * markLessonCompleted - 标记某课时为已完成
   */
  function markLessonCompleted(lessonSlug: string) {
    progress.completeLesson(lessonSlug)
  }

  /**
   * getCompletedLessonsForTopic - 获取某 Topic 下已完成的课时 slug 列表
   *
   * 当前实现从 localStorage 的 completedLessons 中按 slug 前缀匹配。
   * 这是一个简化的 Mock 实现，未来 Progress Engine 会提供结构化数据。
   */
  function getCompletedLessonsForTopic(_topicSlug: string): string[] {
    // 当前 completedLessons 只存 slug，无法直接按 topic 过滤
    // 返回空数组作为占位，未来 Progress Engine 会提供完整数据
    return []
  }

  return {
    hasProgress,
    currentTopicSlug,
    currentTopicTitle,
    currentLessonSlug,
    currentLessonTitle,
    recentLearning,
    streakDays,
    getTopicState,
    getLessonState,
    getStateLabel,
    recordLesson,
    markLessonCompleted,
    LearningState
  }
}
