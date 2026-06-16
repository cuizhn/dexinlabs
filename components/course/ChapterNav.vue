<!--
  ChapterNav 组件 - 章节导航
  功能说明：
  - 在章节内容底部展示"上一章"和"下一章"的导航链接
  - 左侧显示上一章（带左箭头），右侧显示下一章（带右箭头）
  - 如果没有上一章或下一章，显示占位元素保持布局对称
  - 移动端（≤768px）切换为垂直布局，隐藏占位元素
-->
<template>
  <div class="chapter-nav">
    <!-- 上一章导航：有上一章时显示链接，否则显示占位元素 -->
    <NuxtLink
      v-if="prev"
      :to="`/courses/${courseId}/${prev.slug}`"
      class="chapter-nav__item chapter-nav__item--prev"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div class="chapter-nav__info">
        <span class="chapter-nav__label">上一章</span>
        <span class="chapter-nav__title">{{ prev.title }}</span>
      </div>
    </NuxtLink>
    <!-- 无上一章时的占位元素，保持布局对称 -->
    <div v-else class="chapter-nav__placeholder"></div>

    <!-- 下一章导航：有下一章时显示链接，否则显示占位元素 -->
    <NuxtLink
      v-if="next"
      :to="`/courses/${courseId}/${next.slug}`"
      class="chapter-nav__item chapter-nav__item--next"
    >
      <div class="chapter-nav__info">
        <span class="chapter-nav__label">下一章</span>
        <span class="chapter-nav__title">{{ next.title }}</span>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </NuxtLink>
    <!-- 无下一章时的占位元素，保持布局对称 -->
    <div v-else class="chapter-nav__placeholder"></div>
  </div>
</template>

<script setup>
/**
 * 章节导航组件：上一章/下一章切换
 * @component ChapterNav
 */

defineProps({
  /** 课程 ID，用于构建章节链接路径 */
  courseId: {
    type: String,
    required: true,
  },
  /** 上一章信息对象，包含 slug 和 title，无上一章时为 null */
  prev: {
    type: Object,
    default: null,
  },
  /** 下一章信息对象，包含 slug 和 title，无下一章时为 null */
  next: {
    type: Object,
    default: null,
  },
})
</script>

<style scoped>
/* 章节导航容器：水平布局、两端对齐、顶部边框分隔 */
.chapter-nav {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

/* 导航项：水平布局、带边框和圆角、悬停变色 */
.chapter-nav__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 48%;
}

/* 导航项悬停样式：主题色边框、阴影 */
.chapter-nav__item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

/* 下一章导航项：右对齐、反转布局方向（箭头在右侧） */
.chapter-nav__item--next {
  margin-left: auto;
  text-align: right;
  flex-direction: row-reverse;
}

/* 下一章信息区域右对齐 */
.chapter-nav__item--next .chapter-nav__info {
  text-align: right;
}

/* 导航信息区域：垂直排列标签和标题 */
.chapter-nav__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 导航标签（"上一章"/"下一章"）：小字号、弱化颜色、大写字母 */
.chapter-nav__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 章节标题：小字号、加粗 */
.chapter-nav__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

/* 占位元素：保持两端对齐布局 */
.chapter-nav__placeholder {
  flex: 1;
  max-width: 48%;
}

/* 响应式：平板及以下屏幕切换为垂直布局 */
@media (max-width: 768px) {
  .chapter-nav {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .chapter-nav__item {
    max-width: 100%;
  }

  /* 移动端隐藏占位元素 */
  .chapter-nav__placeholder {
    display: none;
  }
}
</style>
