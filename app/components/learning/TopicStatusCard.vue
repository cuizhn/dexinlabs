<template>
  <!-- Topic 状态卡片 - 知识地图中展示每个 Topic 的学习状态 -->
  <NuxtLink
    :to="`/courses/${topic.slug}`"
    class="card"
    :class="topicInfo.state.toLowerCase()"
  >
    <div class="header">
      <h3 class="title">{{ topic.title }}</h3>
      <LearningStateBadge :state="topicInfo.state" />
    </div>

    <div class="footer">
      <span v-if="topicInfo.state === LearningState.MASTERED" class="cta mastered">
        复习巩固 →
      </span>
      <span v-else-if="topicInfo.state === LearningState.IN_PROGRESS" class="cta in-progress">
        继续学习 →
      </span>
      <span v-else class="cta">
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
  order: number
}

const props = defineProps<{
  /** Topic 数据 */
  topic: TopicData
  /** 该 Topic 下的总课时数 */
  totalLessons: number
}>()

const { getTopicState } = useLearningState()

/** Topic 的学习状态信息 */
const topicInfo = computed(() => getTopicState(props.topic.slug, props.totalLessons))
</script>

<style scoped>
.card {
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

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.card.mastered:hover {
  border-color: var(--color-success-dark);
}

.card.in-progress:hover {
  border-color: var(--color-primary);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
}

.footer {
  border-top: 1px dashed var(--color-border);
  padding-top: var(--spacing-md);
}

.cta {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-primary);
}

.cta.mastered {
  color: var(--color-success-dark);
}

.cta.in-progress {
  color: var(--color-primary);
}
</style>
