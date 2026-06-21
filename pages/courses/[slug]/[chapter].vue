<!-- 页面路径: /courses/[slug]/[chapter] -->
<!-- 章节阅读页：三栏布局（左侧章节侧边栏 + 中间内容区 + 右侧目录），含面包屑导航和上下章切换 -->
<template>
  <div class="chapter-page">
    <div class="container">
      <div class="chapter-page__layout">
        <!-- 左侧：章节导航侧边栏 -->
        <aside class="chapter-page__sidebar">
          
        </aside>
        <article class="chapter-page__content">
          <!-- 使用 Nuxt Content 渲染 Markdown 章节文档，渲染完成后通过 rendered 事件获取目录 -->
          <ContentRenderer
            v-if="chapter"
            :doc="chapter"
          />
          <!-- 文档加载中提示 -->
          <div v-else class="chapter-page__empty">
            <p>章节内容加载中...</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>

import { useChapter }
  from '~/composables/course/useChapter
const route = useRoute()

const {
  chapter,
  navigation
} = await useChapter(
  route.params.course,
  route.params.chapter
)
</script>

<style scoped>
/* ==================== 页面布局 ==================== */
/* 页面根容器 */
.chapter-page {
  padding-bottom: var(--spacing-2xl);
}
/* 页面头部：灰色背景，底部带分隔线 */
.chapter-page__header {
  padding: var(--spacing-lg) 0;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}



/* 当前页面文字：加粗主色 */
.chapter-page__breadcrumb-current {
  color: var(--color-text-primary);
  font-weight: 500;
}
/* 章节标题 */
.chapter-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

/* ==================== 主体内容区 ==================== */
/* 内容区域 */
/* 三栏网格布局：侧边栏(240px) + 主内容区(自适应) */
.chapter-page__layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--spacing-xl);
  align-items: start;
  padding: var(--spacing-xl) 0;
}
/* 左侧侧边栏 */
.chapter-page__sidebar {
  position: relative;
}

/* 章节正文容器：白底卡片样式 */
article {
  margin: 0 auto;
  max-width: 800px;
  user-select: text;


}

/* 空状态提示 */
.chapter-page__empty {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-muted);
}



/* ==================== 响应式适配 ==================== */
/* 平板端（≤1024px）：隐藏右侧目录栏，两栏布局 */
@media (max-width: 1024px) {
  .chapter-page__layout {
    grid-template-columns: 220px 1fr;
  }
}

/* 手机端（≤768px）：单栏布局，隐藏左侧侧边栏 */
@media (max-width: 768px) {
  .chapter-page__layout {
    grid-template-columns: 1fr;
  }
  .chapter-page__sidebar {
    display: none;
  }
  .chapter-page__title {
    font-size: 1.375rem;
  }
  .chapter-page__content {
    padding: var(--spacing-lg);
  }
}
</style>
