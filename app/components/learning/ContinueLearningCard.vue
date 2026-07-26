<template>
  <div v-if="recentLearning" class="bg-bg-white border border-border rounded-xl p-8 text-left shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <span class="text-sm font-semibold text-primary uppercase tracking-[0.06em]">继续学习</span>
      <span v-if="streakDays > 0" class="text-[0.8125rem] text-text-secondary font-medium">
        🔥 连续 {{ streakDays }} 天
      </span>
    </div>

    <div class="mb-4">
      <span class="block text-[1.5rem] font-bold text-text-primary mb-1">{{ recentLearning.topicTitle }}</span>
      <span class="block text-base text-text-secondary">
        第 {{ recentLearning.lessonIndex }} 课 · {{ recentLearning.lessonTitle }}
      </span>
    </div>

    <div class="mb-6">
      <span class="block text-[0.8125rem] text-text-light mb-2">
        {{ recentLearning.lessonIndex }} / {{ recentLearning.totalLessons }}
      </span>
      <div class="h-[6px] bg-bg-secondary rounded-[3px] overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-primary to-secondary rounded-[3px] transition-all duration-500"
          :style="{ width: `${(recentLearning.lessonIndex / recentLearning.totalLessons) * 100}%` }"
        ></div>
      </div>
    </div>

    <NuxtLink
      :to="`/${recentLearning.topicSlug}`"
      class="flex items-center justify-center gap-2 w-full py-4 px-8 rounded-md font-semibold text-base no-underline bg-gradient-to-br from-primary to-[#6366F1] text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)]"
    >
      继续学习
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useLearningState } from '~/composables/useLearningState'

const { recentLearning, streakDays } = useLearningState()
</script>
