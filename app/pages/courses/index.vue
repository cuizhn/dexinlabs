<template>
  <nav class="page">
    <header class="header">
      <div class="container">
        <p class="label">课程目录</p>
        <h1 class="title">选择你想学习的课时，直接进入学习</h1>
      </div>
    </header>

    <section class="body">
      <div class="container">
        <div v-if="loading" class="loading">加载中...</div>

        <template v-else>
          <section
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
                >
                  <NuxtLink
                    :to="`/courses/${item.topic.slug}/${lesson.slug}`"
                    class="lesson-link"
                  >
                    <span class="lesson-index">{{ String(idx + 1).padStart(2, '0') }}</span>
                    <span class="lesson-title">{{ lesson.title }}</span>
                    <span class="lesson-arrow" aria-hidden="true">→</span>
                  </NuxtLink>
                </li>
              </ol>
            </div>
          </section>

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
 * 用户点击 Lesson 后进入 /courses/{topicSlug}/{lessonSlug} 学习页面。
 *
 * 视觉：与首页共享同一套设计系统——黑白灰、结构线、大留白、少卡片。
 * 课程结构本身成为页面设计：Topic 之间用 1px 结构线分隔，
 * 课时以文本行 + 极细分割线呈现，不使用彩色卡片。
 */
useHead({ title: '课程目录' })

const { catalog, loading } = await useCourseCatalog()
</script>

<style scoped>
.page {
  width: 100%;
  padding-inline: var(--spacing-lg);
}

.container {
  max-width: 860px;
  margin-inline: auto;
}

.header {
  padding: var(--spacing-3xl) 0 var(--spacing-2xl);
}

.label {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}

.title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.body {
  padding: 0 0 var(--spacing-3xl);
}

.loading,
.empty {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

/* ── Topic：以 1px 结构线分界，形成页面骨架 ── */
.topic {
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-xl) 0 var(--spacing-2xl);
}

.topic-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xl);
}

.chapter {
  margin-bottom: var(--spacing-xl);
}

.chapter:last-child {
  margin-bottom: 0;
}

.chapter-title {
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm);
}

/* ── 课时：文本行 + 极细分割线，无卡片 ── */
.lessons {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lesson + .lesson {
  border-top: 1px solid var(--color-border-light);
}

.lesson-link {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-lg);
  padding: 0.875rem 0.25rem;
  text-decoration: none;
  color: var(--color-text-primary);
  transition: background-color 0.15s ease, padding-left 0.15s ease;
}

.lesson-link:hover {
  background-color: var(--color-bg-secondary);
  padding-left: 0.75rem;
}

.lesson-index {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  min-width: 2rem;
  flex-shrink: 0;
}

.lesson-title {
  flex: 1;
  font-size: var(--text-base);
  font-weight: 500;
  line-height: 1.6;
}

.lesson-arrow {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease;
  align-self: center;
}

.lesson-link:hover .lesson-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--color-primary);
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .page {
    padding-inline: var(--spacing-md);
  }

  .header {
    padding: var(--spacing-2xl) 0 var(--spacing-xl);
  }

  .topic {
    padding: var(--spacing-lg) 0 var(--spacing-xl);
  }

  .topic-title {
    font-size: var(--text-xl);
    margin-bottom: var(--spacing-lg);
  }

  .lesson-link {
    gap: var(--spacing-md);
    padding: 0.75rem 0.125rem;
  }

  .lesson-link:hover {
    padding-left: 0.5rem;
  }
}
</style>
