<template>
  <!-- Topic 状态卡片 - 知识地图中展示每个 Topic 的学习状态 -->
  <NuxtLink
    :to="`/${domainSlug}/${topic.slug}`"
    class="topic-status-card"
    :class="`topic-status-card--${topicInfo.state.toLowerCase()}`"
  >
    <div class="topic-status-card__header">
      <h3 class="topic-status-card__title">{{ topic.title }}</h3>
      <LearningStateBadge :state="topicInfo.state" />
    </div>

    <p v-if="topic.summary" class="topic-status-card__desc">
      {{ topic.summary }}
    </p>

    <div class="topic-status-card__footer">
      <span v-if="topicInfo.state === LearningState.MASTERED" class="topic-status-card__cta topic-status-card__cta--done">
        复习巩固 →
      </span>
      <span v-else-if="topicInfo.state === LearningState.IN_PROGRESS" class="topic-status-card__cta topic-status-card__cta--continue">
        继续学习 →
      </span>
      <span v-else class="topic-status-card__cta">
        开始学习 →
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
/**
 * TopicStatusCard - Topic 状态卡片组件
 *
 * 知识地图页中每个 Topic 的展示卡片。
 * 显示标题、简介、学习状态徽章和对应的行动引导。
 * 学习状态由 useLearningState 统一提供。
 */
import { LearningState, useLearningState } from '~/composables/useLearningState'

interface TopicData {
  slug: string
  title: string
  summary?: string | null
  order: number
}

const props = defineProps<{
  /** Topic 数据 */
  topic: TopicData
  /** 所属 Domain 的 slug（用于构建路由） */
  domainSlug: string
  /** 该 Topic 下的总课时数 */
  totalLessons: number
}>()

const { getTopicState } = useLearningState()

/** Topic 的学习状态信息 */
const topicInfo = computed(() => getTopicState(props.topic.slug, props.totalLessons))
</script>

<style scoped>
.topic-status-card {
  display: block;
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: inherit;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}

.topic-status-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

/* 已掌握状态 - 绿色边框 */
.topic-status-card--mastered:hover {
  border-color: #16a34a;
}

/* 正在学习状态 - 蓝色边框 */
.topic-status-card--in_progress:hover {
  border-color: var(--color-primary);
}

.topic-status-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.topic-status-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
}

.topic-status-card__desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-status-card__footer {
  border-top: 1px dashed var(--color-border);
  padding-top: var(--spacing-md);
}

.topic-status-card__cta {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary);
}

.topic-status-card__cta--done {
  color: #16a34a;
}

.topic-status-card__cta--continue {
  color: var(--color-primary);
}
</style>
