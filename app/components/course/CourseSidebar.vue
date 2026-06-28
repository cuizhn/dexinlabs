<!--
  CourseSidebar 组件 - 章节目录侧边栏
  功能说明：
  - 展示课程的章节目录列表，用于课程详情页的侧边栏导航
  - 每个章节项显示序号和标题，点击跳转到对应章节页面
  - 当前章节高亮显示（通过 currentSlug 匹配）
  - 使用 sticky 定位，滚动时固定在视口顶部
-->
<template>
  <div class="course-sidebar">
    <h3 class="course-sidebar__title">章节目录</h3>
    <nav class="course-sidebar__list">
      <NuxtLink
        v-for="chapter in chapters"
        :key="chapter.slug"
        :to="`/course/${chapter.slug}`"
        class="course-sidebar__item"
        :class="{ 'course-sidebar__item--active': chapter.slug === currentSlug }"
      >
        <span class="course-sidebar__order">{{ chapter.order }}</span>
        <span class="course-sidebar__name">{{ chapter.title }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
/**
 * 课程侧边栏组件：展示章节列表，高亮当前章节
 * @component CourseSidebar
 */

interface ChapterSidebarItem {
  slug: string
  order: number | string
  title: string
}

defineProps<{
  chapters: ChapterSidebarItem[]
  currentSlug?: string
}>()
</script>

<style scoped>
.course-sidebar {
  position: sticky;
  top: 80px;
}

.course-sidebar__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

.course-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.course-sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.course-sidebar__item:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.course-sidebar__item--active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.course-sidebar__order {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: var(--text-xs);
  font-weight: 600;
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
}

.course-sidebar__item--active .course-sidebar__order {
  background-color: var(--color-primary);
  color: #fff;
}

.course-sidebar__name {
  line-height: 1.4;
}
</style>
