<!--
  CourseSidebar 组件 - 课程侧边栏
  功能说明：
  - 展示课程的章节目录列表，用于课程详情页的侧边栏导航
  - 每个章节项显示序号和标题，点击跳转到对应章节页面
  - 当前章节高亮显示（通过 currentSlug 匹配）
  - 使用 sticky 定位，滚动时固定在视口顶部
-->
<template>
  <div class="course-sidebar">
    <!-- 章节目录标题 -->
    <h3 class="course-sidebar__title">章节目录</h3>
    <!-- 章节列表导航 -->
    <nav class="course-sidebar__list">
      <!-- 章节项：显示序号和标题，当前章节高亮 -->
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
/**
 * 课程侧边栏组件：展示章节列表，高亮当前章节
 * @component CourseSidebar
 */

defineProps({
  /** 课程 ID，用于构建章节链接路径 */
  courseId: {
    type: String,
    required: true,
  },
  /** 章节数据数组，每项包含 slug、order、title 等字段 */
  chapters: {
    type: Array,
    required: true,
  },
  /** 当前章节的 slug，用于高亮匹配 */
  currentSlug: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
/* 侧边栏容器：sticky 定位，滚动时固定在顶部 */
.course-sidebar {
  position: sticky;
  top: 80px;
}

/* 章节目录标题：小字号、大写字母、字间距 */
.course-sidebar__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

/* 章节列表：垂直排列、紧凑间距 */
.course-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 章节项：水平布局、带圆角和过渡动画 */
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

/* 章节项悬停样式：背景变色、文字加深 */
.course-sidebar__item:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

/* 当前激活章节样式：主题色浅背景、主题色文字、加粗 */
.course-sidebar__item--active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

/* 章节序号：圆形背景、居中显示 */
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

/* 当前激活章节的序号：主题色背景、白色文字 */
.course-sidebar__item--active .course-sidebar__order {
  background-color: var(--color-primary);
  color: #fff;
}

/* 章节名称文字 */
.course-sidebar__name {
  line-height: 1.4;
}
</style>
