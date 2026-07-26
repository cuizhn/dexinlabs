<template>
  <div>
    <section class="py-8 px-6 pb-6 bg-gradient-to-br from-bg-secondary to-transparent">
      <div class="container">
        <nav class="flex gap-2 items-center text-sm mb-6 flex-wrap">
          <NuxtLink to="/map" class="text-text-secondary no-underline hover:text-primary">知识地图</NuxtLink>
          <span class="text-text-light">/</span>
          <span class="text-text-primary font-medium">练习</span>
        </nav>

        <h1 class="text-[1.875rem] font-bold text-text-primary mb-2">
          {{ topicTitle ? `${topicTitle} · 练习` : '练习' }}
        </h1>

        <p class="text-base text-text-secondary max-w-[640px] leading-[1.6]">
          思考 → 尝试 → 提示 → 修正 → 理解 → 总结 → 迁移。让每一次练习都成为思维的生长。
        </p>
      </div>
    </section>

    <section class="py-8 px-6 pb-24">
      <div class="container" style="max-width: 760px;">
        <div v-if="loading" class="py-12 text-center text-text-muted">练习内容加载中...</div>

        <template v-else-if="exercise">
          <h2 class="text-xl font-semibold text-text-primary mb-3">{{ exercise.title || '练习题' }}</h2>

          <div v-if="exercise.description" class="px-4 py-3 bg-bg-secondary border-l-3 border-primary rounded-r-md text-text-secondary leading-[1.6] mb-6">
            {{ exercise.description }}
          </div>

          <ContentRenderer v-if="exercise" :value="exercise" />
        </template>

        <div v-else class="py-12">
          <div class="px-8 py-12 bg-bg-white border border-dashed border-border rounded-lg text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-primary-light text-primary text-[1.75rem] flex items-center justify-center">✎</div>
            <h3 class="text-xl font-semibold text-text-primary mb-2">练习内容准备中</h3>
            <p class="text-[0.95rem] text-text-secondary leading-[1.6] max-w-[440px] mx-auto mb-6">练习正在精心设计中。请先完成课时学习，扎实掌握每个概念。</p>
            <NuxtLink to="/map" class="inline-block font-medium text-primary no-underline hover:underline">← 返回知识地图</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ContentRenderer from '../../components/content/Renderer.vue'
import type { Exercise } from '@content'

const route = useRoute()
const topicSlug = computed(() => typeof route.query.topic === 'string' ? route.query.topic : '')

interface ExerciseResponse {
  exercises: Exercise[]
  topicTitle: string
}

const { data: exerciseData, pending: loading } = await useAsyncData(
  () => `exercises:${topicSlug.value}`,
  () => $fetch<ExerciseResponse>(`/api/exercises`, { params: { topic: topicSlug.value } }),
  { default: () => ({ exercises: [], topicTitle: '' }) as ExerciseResponse }
)

const exercise = computed(() => {
  const list = exerciseData.value?.exercises
  if (Array.isArray(list) && list.length > 0) return list[0]
  return null
})

const topicTitle = computed(() => exerciseData.value?.topicTitle || '')

useHead({
  title: computed(() => (topicTitle.value ? `${topicTitle.value} · 练习` : '练习'))
})
</script>
