<template>
  <nav class="page">
    <header class="header">
      <div class="container">
        <h1 class="title">课程目录</h1>
        <p class="desc">
          选择你想学习的课时，直接进入学习
        </p>
      </div>
    </header>

    <section class="body">
      <div class="container">
        <div v-if="loading" class="loading">加载中...</div>

        <template v-else>
          <div
            v-for="item in catalog"
            :key="item.topic.slug"
            class="topic"
          >
            <h2 class="topic-title">{{ item.topic.title }}</h2>

            <div
              v-for="ch in item.chapters"
              :key="ch.chapter.slug"
              class="chapter"
            >
              <h3 class="chapter-title">{{ ch.chapter.title }}</h3>

              <ol class="lessons">
                <li
                  v-for="(lesson, idx) in ch.lessons"
                  :key="lesson.slug"
                  class="lesson"
                  :class="{ completed: getLessonState(lesson.slug).isCompleted }"
                >
                  <NuxtLink
                    :to="`/courses/${item.topic.slug}/${lesson.slug}`"
                    class="lesson-link"
                  >
                    <span class="lesson-index">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>
                      
                      <!-- {{ String(idx + 1).padStart(2, '0') }} -->
                    </span>
                    <span class="lesson-title">{{ lesson.title }}</span>
                    
                  </NuxtLink>
                </li>
              </ol>
            </div>
          </div>

          <div v-if="catalog.length === 0" class="empty">
            暂无课程内容
          </div>
        </template>
      </div>
    </section>
  </nav>
</template>

<script setup lang="ts">
/**
 * 课程目录页 - /courses
 *
 * 唯一的课程目录入口，直接展示：
 * Topic → Chapter → Lesson 完整层级。
 *
 * 用户点击 Lesson 后进入 /{topicSlug}/{lessonSlug} 学习页面。
 * 无中间页面（无 Topic Index、无 Course Index）。
 */
import { useLearningState } from '~/composables/useLearningState'

useHead({ title: '课程目录' })

const { catalog, loading } = await useCourseCatalog()

const { getLessonState } = useLearningState()


</script>

<style scoped>
.page {
  min-height: 100vh;
  margin: 0 auto;
  min-width: 760px;
}

.header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}

.title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}

.desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}

.body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}

.loading,
.empty {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

.topic {
  margin-bottom: var(--spacing-3xl);
}

.topic-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary);
}

.chapter {
  margin-bottom: var(--spacing-xl);
}

.chapter-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm);
}

.lessons {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xs);
}

@media (max-width: 768px) {
  .lessons {
    grid-template-columns: 1fr;
  }
}

.lesson-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  
  text-decoration: none;
  color: inherit;
  transition: background 150ms ease;
}

.lesson-link:hover {
  background: var(--color-bg-white);
}

.lesson.completed .lesson-link {
  border-color: var(--color-success-border);
  background: var(--color-success-bg);
}

.lesson-index {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-primary);
  min-width: 2rem;
  text-align: center;
}

.lesson.completed .lesson-index {
  color: var(--color-success-dark);
}


.lesson-title {
  flex: 1;
  font-weight: 500;
  color: var(--color-text-primary);
}



.lesson-link:hover  {
  color: var(--color-primary);
  transform: translateX(4px);
}
</style>
