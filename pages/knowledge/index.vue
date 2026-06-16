<!-- 页面路径: /knowledge -->
<!-- 知识图谱页：占位页面，功能开发中，显示提示信息和跳转链接 -->
<template>
  <div class="knowledge-page">
    <!-- 页面头部：标题和描述 -->
    <section class="knowledge-page__header">
      <div class="container container-sm">
        <h1 class="knowledge-page__title">知识图谱</h1>
        <p class="knowledge-page__description">可视化展示知识点之间的关联关系</p>
      </div>
    </section>

    <!-- 占位内容区：显示"功能开发中"提示和跳转按钮 -->
    <section class="knowledge-page__content">
      <div class="container container-sm text-center">
        <div class="knowledge-page__placeholder">
          <div class="knowledge-page__placeholder-icon">🗺️</div>
          <h2 class="knowledge-page__placeholder-title">功能开发中</h2>
          <p class="knowledge-page__placeholder-desc">知识图谱功能正在规划中，敬请期待</p>
          <NuxtLink to="/courses" class="btn btn--primary">浏览课程</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// 设置页面标题
useHead({ title: '知识图谱' })
</script>

<style scoped>
/* ==================== 页面布局 ==================== */
/* 页面根容器 */
.knowledge-page { padding-bottom: var(--spacing-2xl); }
/* 页面头部：灰色背景，居中文字 */
.knowledge-page__header { padding: var(--spacing-2xl) 0; background-color: var(--color-bg-secondary); text-align: center; }
/* 页面标题 */
.knowledge-page__title { font-size: 2.5rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-md); }
/* 页面描述 */
.knowledge-page__description { font-size: 1.125rem; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; }

/* ==================== 占位内容区 ==================== */
/* 内容区域 */
.knowledge-page__content { padding: var(--spacing-2xl) 0; }
/* 占位提示卡片 */
.knowledge-page__placeholder { padding: var(--spacing-2xl); }
/* 占位图标：大号地图emoji */
.knowledge-page__placeholder-icon { font-size: 4rem; margin-bottom: var(--spacing-lg); }
/* 占位标题 */
.knowledge-page__placeholder-title { font-size: 1.5rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); }
/* 占位描述文字 */
.knowledge-page__placeholder-desc { color: var(--color-text-secondary); margin-bottom: var(--spacing-xl); }

/* ==================== 响应式适配 ==================== */
/* 手机端：缩小标题字号 */
@media (max-width: 768px) {
  .knowledge-page__title { font-size: 2rem; }
}
</style>
