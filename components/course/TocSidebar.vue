<template>
  <!-- 目录侧边栏：从渲染内容提取的标题目录 -->
  <div class="toc-sidebar" :class="{ 'toc-sidebar--mobile': isMobile }">
    <div class="toc-sidebar__header">
      <h3 class="toc-sidebar__title">目录</h3>
      <button v-if="isMobile" class="toc-sidebar__close" @click="$emit('close')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <nav class="toc-sidebar__list">
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
// 目录侧边栏：展示页面标题目录，支持点击跳转
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const activeId = ref('')

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

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

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.toc-sidebar {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.toc-sidebar--mobile {
  position: static;
  max-height: none;
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

.toc-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.toc-sidebar__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

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

.toc-sidebar__close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.toc-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

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

.toc-sidebar__item:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.toc-sidebar__item--active {
  color: var(--color-primary);
  font-weight: 600;
  background-color: var(--color-primary-light);
}

.toc-sidebar__item--h3 {
  padding-left: var(--spacing-md);
}
</style>
