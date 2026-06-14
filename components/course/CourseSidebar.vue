<template>
  <!-- 课程侧边栏：章节列表 -->
  <div class="course-sidebar">
    <h3 class="course-sidebar__title">章节目录</h3>
    <nav class="course-sidebar__list">
      <NuxtLink
        v-for="chapter in chapters"
        :key="chapter.slug"
        :to="`/courses/${courseId}/${chapter.slug}`"
        class="course-sidebar__item"
        :class="{ 'course-sidebar__item--active': chapter.slug === currentSlug }"
      >
        <span class="course-sidebar__order">{{ chapter.order }}</span>
        <span class="course-sidebar__name">{{ chapter.title }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
// 课程侧边栏：展示章节列表，高亮当前章节
defineProps({
  courseId: {
    type: String,
    required: true,
  },
  chapters: {
    type: Array,
    required: true,
  },
  currentSlug: {
    type: String,
    default: '',
  },
})
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
