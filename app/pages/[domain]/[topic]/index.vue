<template>
  <div class="topic-detail">
    <template v-if="topic">
      <!-- 顶部：Topic 信息 + 学习目标 + 学习意义 -->
      <header class="topic-detail__header">
        <div class="container">
          <NuxtLink :to="`/map`" class="topic-detail__back">← 返回知识地图</NuxtLink>

          <div class="topic-detail__title-row">
            <h1 class="topic-detail__title">{{ topic.title }}</h1>
            <LearningStateBadge :state="topicState.state" />
          </div>

          <p class="topic-detail__objective">
            学完这一主题，你将能够{{ topic.summary || '掌握相关知识与技能。' }}
          </p>

          <p class="topic-detail__significance">
            这一主题是数学知识体系中的重要环节，帮助你建立从基础到进阶的桥梁。
          </p>
        </div>
      </header>

      <!-- 中部：Lesson 列表（显示状态） -->
      <section class="topic-detail__body">
        <div class="container">
          <LearningTopicLessonList
            v-if="lessons.length"
            :lessons="lessons"
            :domain-slug="domainSlug"
            :topic-slug="topicSlug"
            title="课时列表"
          />

          <!-- 底部：根据学习状态切换 -->
          <div class="topic-detail__actions">
            <!-- 待学习 -->
            <template v-if="topicState.state === LearningState.NOT_STARTED">
              <NuxtLink
                v-if="lessons.length"
                :to="firstLessonPath"
                class="topic-detail__btn topic-detail__btn--primary"
              >
                开始学习
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </NuxtLink>
            </template>

            <!-- 学习中 -->
            <template v-else-if="topicState.state === LearningState.IN_PROGRESS">
              <NuxtLink
                v-if="lessons.length"
                :to="firstLessonPath"
                class="topic-detail__btn topic-detail__btn--primary"
              >
                继续学习
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </NuxtLink>
            </template>

            <!-- 已掌握 -->
            <template v-else>
              <NuxtLink
                :to="`/exercise?topic=${topicSlug}`"
                class="topic-detail__btn topic-detail__btn--primary"
              >
                练习巩固
              </NuxtLink>
              <NuxtLink
                v-if="lessons.length"
                :to="firstLessonPath"
                class="topic-detail__btn topic-detail__btn--secondary"
              >
                复习回顾
              </NuxtLink>
            </template>
          </div>

          <!-- 练习入口 -->
          <div v-if="lessons.length" class="topic-detail__exercise">
            <NuxtLink :to="`/exercise?topic=${topicSlug}`" class="exercise-card">
              <div class="exercise-card__icon">✦</div>
              <div class="exercise-card__body">
                <h3 class="exercise-card__title">练习</h3>
                <p class="exercise-card__desc">巩固所学，训练数学思维</p>
              </div>
              <span class="exercise-card__cta">开始练习 →</span>
            </NuxtLink>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="topic-detail__empty">暂未找到该主题</div>
  </div>
</template>

<script setup lang="ts">
/**
 * Topic 页面 - 学习控制中心
 *
 * 不是目录页，而是学习控制枢纽。
 * 根据学习状态自动切换显示：
 * - 待学习：介绍 Topic + 开始学习
 * - 学习中：显示 Lesson 列表 + 继续学习
 * - 已掌握：知识概览 + 练习/复习
 *
 * 学习状态统一由 useLearningState 提供。
 */
import { LearningState, useLearningState } from '~/composables/useLearningState'

const topicSlug = useRouteParam('topic') ?? ''
const domainSlug = useRouteParam('domain') ?? ''

const { topic, lessons } = await useTopicPage(topicSlug)

const { getTopicState } = useLearningState()

/** Topic 的学习状态（当前 Mock 总课时数为 lessons 长度） */
const topicState = computed(() => getTopicState(topicSlug, lessons.value.length))

/** 第一个课时的路径（用于「开始学习」「继续学习」「复习回顾」按钮） */
const firstLessonPath = computed(() =>
  lessons.value[0] ? `/${domainSlug}/${topicSlug}/${lessons.value[0].slug}` : ''
)

useHead({
  title: computed(() => topic.value?.title || '主题')
})
</script>

<style scoped>
.topic-detail__header {
  padding: var(--spacing-xl) 0 var(--spacing-2xl);
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}

.topic-detail__back {
  display: inline-block;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  margin-bottom: var(--spacing-lg);
  transition: color 150ms ease;
}

.topic-detail__back:hover {
  color: var(--color-primary);
}

.topic-detail__title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.topic-detail__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.topic-detail__objective {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
  max-width: 640px;
  margin: 0 0 var(--spacing-md);
}

.topic-detail__significance {
  font-size: 0.9375rem;
  color: var(--color-text-light);
  line-height: 1.6;
  max-width: 640px;
  margin: 0;
}

.topic-detail__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}

/* 底部行动按钮 */
.topic-detail__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
}

.topic-detail__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: all 0.25s ease;
}

.topic-detail__btn--primary {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.topic-detail__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

.topic-detail__btn--secondary {
  background: var(--color-bg-white);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.topic-detail__btn--secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 练习卡片 */
.topic-detail__exercise {
  margin-top: var(--spacing-xl);
}

.exercise-card {
  display: block;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
  text-decoration: none;
  border-radius: var(--border-radius-lg);
}

.exercise-card__icon {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-sm);
}

.exercise-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: #fff;
}

.exercise-card__desc {
  font-size: 0.875rem;
  opacity: 0.85;
  margin: 0 0 var(--spacing-lg);
}

.exercise-card__cta {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 500;
}

.topic-detail__empty {
  padding: var(--spacing-3xl) 0;
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 900px) {
  .topic-detail__title {
    font-size: 1.5rem;
  }

  .topic-detail__objective {
    font-size: 1rem;
  }
}
</style>
