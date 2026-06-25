<!--
  TocSidebar 组件 - 目录侧边栏
  功能说明：
  - 从渲染内容中提取的标题（h2、h3）组成的目录列表
  - 支持点击目录项平滑滚动到对应标题位置
  - 监听页面滚动，自动高亮当前可视区域对应的目录项
  - 移动端模式下显示关闭按钮，通过 emit 通知父组件关闭
  - h3 级标题有额外的缩进，体现层级关系
-->
<template>
  <!-- 目录侧边栏容器：移动端模式添加额外样式 -->
  <div class="toc-sidebar" :class="{ 'toc-sidebar--mobile': isMobile }">
    <!-- 目录头部：标题和移动端关闭按钮 -->
    <div class="toc-sidebar__header">
      <h3 class="toc-sidebar__title">目录</h3>
      <!-- 移动端关闭按钮：点击触发 close 事件 -->
      <button v-if="isMobile" class="toc-sidebar__close" @click="$emit('close')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <!-- 目录列表：展示各级标题链接 -->
    <nav class="toc-sidebar__list">
      <!-- 目录项：根据标题深度添加缩进类名，根据滚动位置高亮当前项 -->
      <a
        v-for="item in items"
        :key="item.id"
        :href="`#${item.id}`"
        class="toc-sidebar__item"
        :class="[
          `toc-sidebar__item--h${item.depth}`,
          { 'toc-sidebar__item--active': activeId === item.id }
        ]"
        @click.prevent="scrollTo(item.id)"
      >
        {{ item.text }}
      </a>
    </nav>
  </div>
</template>

<script setup>
/**
 * 目录侧边栏组件：展示页面标题目录，支持点击跳转和滚动高亮
 * @component TocSidebar
 */
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  /** 目录项数组，每项包含 id（标题锚点）、text（标题文字）、depth（标题层级 2/3） */
  items: {
    type: Array,
    default: () => [],
  },
  /** 是否为移动端模式，移动端模式下显示关闭按钮 */
  isMobile: {
    type: Boolean,
    default: false,
  },
})

/** 关闭事件，移动端模式下点击关闭按钮时触发 */
defineEmits(['close'])

/** 当前高亮的目录项 ID，根据滚动位置自动更新 */
const activeId = ref('')

/**
 * 平滑滚动到指定标题位置
 * @param {string} id - 目标标题元素的 ID
 */
function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * 滚动事件处理函数：遍历所有标题，找到当前可视区域内最靠近顶部的标题
 * 将其 ID 设置为当前高亮项
 */
function onScroll() {
  const headings = document.querySelectorAll('.markdown-body h2, .markdown-body h3')
  let current = ''
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= 100) {
      current = heading.id
    }
  }
  activeId.value = current
}

// 组件挂载时注册滚动监听，使用 passive 优化性能
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

// 组件卸载时移除滚动监听，避免内存泄漏
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
/* 目录侧边栏：sticky 定位、限制最大高度、内容溢出滚动 */
.toc-sidebar {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

/* 移动端模式：取消 sticky 定位，添加边框和内边距 */
.toc-sidebar--mobile {
  position: static;
  max-height: none;
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

/* 目录头部：水平布局、两端对齐 */
.toc-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

/* 目录标题：小字号、大写字母、字间距 */
.toc-sidebar__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 关闭按钮：圆形、居中对齐 */
.toc-sidebar__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

/* 关闭按钮悬停样式 */
.toc-sidebar__close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

/* 目录列表：垂直排列、紧凑间距 */
.toc-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 目录项：小字号、弱化颜色、带圆角和过渡动画 */
.toc-sidebar__item {
  display: block;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
  line-height: 1.5;
}

/* 目录项悬停样式：主题色文字和浅背景 */
.toc-sidebar__item:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

/* 当前高亮的目录项：主题色文字、加粗、浅背景 */
.toc-sidebar__item--active {
  color: var(--color-primary);
  font-weight: 600;
  background-color: var(--color-primary-light);
}

/* h3 级标题目录项：增加左侧缩进，体现层级关系 */
.toc-sidebar__item--h3 {
  padding-left: var(--spacing-md);
}
</style>
