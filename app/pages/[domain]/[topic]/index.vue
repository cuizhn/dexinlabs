<template>
  <div>
    <template v-if="topic">
      <header class="py-8 px-6 pb-12 bg-gradient-to-b from-bg-secondary to-transparent">
        <div class="container">
          <NuxtLink :to="`/map`" class="inline-block text-sm text-text-secondary no-underline mb-6 transition-colors duration-150 hover:text-primary">← 返回知识地图</NuxtLink>

          <div class="flex items-center gap-3 mb-6">
            <h1 class="text-[2rem] font-bold text-text-primary md:text-[1.5rem]">{{ topic.title }}</h1>
            <LearningStateBadge :state="topicState.state" />
          </div>

          <p class="text-lg text-text-secondary leading-[1.75] max-w-[640px] mb-3 md:text-base">
            学完这一主题，你将能够{{ topic.summary || '掌握相关知识与技能。' }}
          </p>

          <p class="text-[0.9375rem] text-text-light leading-[1.6] max-w-[640px]">
            这一主题是数学知识体系中的重要环节，帮助你建立从基础到进阶的桥梁。
          </p>
        </div>
      </header>

      <section class="py-8 px-6 pb-24">
        <div class="container">
          <LearningTopicLessonList
            v-if="lessons.length"
            :lessons="lessons"
            :domain-slug="domainSlug"
            :topic-slug="topicSlug"
            title="课时列表"
          />

          <div class="flex gap-3 mb-8 flex-wrap">
            <template v-if="topicState.state === LearningState.NOT_STARTED">
              <NuxtLink
                v-if="lessons.length"
                :to="firstLessonPath"
                class="inline-flex items-center gap-2 px-8 py-[14px] rounded-md font-semibold text-[0.9375rem] bg-gradient-to-br from-primary to-[#6366F1] text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)]"
              >
                开始学习
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </NuxtLink>
            </template>

            <template v-else-if="topicState.state === LearningState.IN_PROGRESS">
              <NuxtLink
                v-if="lessons.length"
                :to="firstLessonPath"
                class="inline-flex items-center gap-2 px-8 py-[14px] rounded-md font-semibold text-[0.9375rem] bg-gradient-to-br from-primary to-[#6366F1] text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)]"
              >
                继续学习
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </NuxtLink>
            </template>

            <template v-else>
              <NuxtLink
                :to="`/exercise?topic=${topicSlug}`"
                class="inline-flex items-center gap-2 px-8 py-[14px] rounded-md font-semibold text-[0.9375rem] bg-gradient-to-br from-primary to-[#6366F1] text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.4)]"
              >
                练习巩固
              </NuxtLink>
              <NuxtLink
                v-if="lessons.length"
                :to="firstLessonPath"
                class="inline-flex items-center gap-2 px-8 py-[14px] rounded-md font-semibold text-[0.9375rem] bg-bg-white text-text-primary border border-border transition-all duration-250 hover:border-primary hover:text-primary"
              >
                复习回顾
              </NuxtLink>
            </template>
          </div>

          <div v-if="lessons.length" class="mt-8">
            <NuxtLink :to="`/exercise?topic=${topicSlug}`" class="exercise-card">
              <div class="text-[1.5rem] mb-2">✦</div>
              <div>
                <h3 class="text-lg font-semibold text-white mb-1">练习</h3>
                <p class="text-sm opacity-85 mb-4">巩固所学，训练数学思维</p>
              </div>
              <span class="text-sm font-medium">开始练习 →</span>
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="py-24 text-center text-text-muted">暂未找到该主题</div>
  </div>
</template>

<script setup lang="ts">
import { LearningState, useLearningState } from '~/composables/useLearningState'

const topicSlug = useRouteParam('topic') ?? ''
const domainSlug = useRouteParam('domain') ?? ''

const { topic, lessons } = await useTopicPage(topicSlug)

const { getTopicState } = useLearningState()

const topicState = computed(() => getTopicState(topicSlug, lessons.value.length))

const firstLessonPath = computed(() =>
  lessons.value[0] ? `/${domainSlug}/${topicSlug}/${lessons.value[0].slug}` : ''
)

useHead({
  title: computed(() => topic.value?.title || '主题')
})
</script>
