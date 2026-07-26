<template>
  <NuxtLink
    :to="`/${domainSlug}/${topic.slug}`"
    class="block p-6 bg-bg-white border border-border rounded-lg no-underline text-inherit transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
    :class="cardClass"
  >
    <div class="flex justify-between items-start gap-3 mb-2">
      <h3 class="text-lg font-semibold text-text-primary leading-[1.4] m-0">{{ topic.title }}</h3>
      <LearningStateBadge :state="topicInfo.state" />
    </div>

    <p v-if="topic.summary" class="text-sm text-text-secondary leading-[1.6] mb-3 line-clamp-2">
      {{ topic.summary }}
    </p>

    <div class="border-t border-dashed border-border pt-3">
      <span
        class="text-sm font-medium"
        :class="ctaClass"
      >
        {{ ctaText }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { LearningState, useLearningState } from '~/composables/useLearningState'

interface TopicData {
  slug: string
  title: string
  summary?: string | null
  order: number
}

const props = defineProps<{
  topic: TopicData
  domainSlug: string
  totalLessons: number
}>()

const { getTopicState } = useLearningState()

const topicInfo = computed(() => getTopicState(props.topic.slug, props.totalLessons))

const cardClass = computed(() => {
  switch (topicInfo.value.state) {
    case LearningState.MASTERED:
      return 'hover:border-[#16a34a]'
    case LearningState.IN_PROGRESS:
      return 'hover:border-primary'
    default:
      return 'hover:border-primary'
  }
})

const ctaClass = computed(() => {
  switch (topicInfo.value.state) {
    case LearningState.MASTERED:
      return 'text-[#16a34a]'
    case LearningState.IN_PROGRESS:
      return 'text-primary'
    default:
      return 'text-primary'
  }
})

const ctaText = computed(() => {
  switch (topicInfo.value.state) {
    case LearningState.MASTERED:
      return '复习巩固 →'
    case LearningState.IN_PROGRESS:
      return '继续学习 →'
    default:
      return '开始学习 →'
  }
})
</script>
