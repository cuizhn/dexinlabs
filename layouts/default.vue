<!--
  默认布局 (layouts/default.vue)
  功能说明：
  本文件是 Nuxt 应用的默认布局组件，所有未指定布局的页面都会使用此布局。
  主要职责：
  - 提供统一的页面结构：顶部导航栏 + 主内容区 + 页脚
  - 顶部导航栏固定在页面顶部，主内容区自动填充剩余空间
  - 页脚显示在页面底部
-->
<template>
  <!-- 默认布局：顶部导航 + 主内容区 + 页脚 -->
  <div class="layout">
    <!-- 顶部导航栏组件，包含网站 Logo、导航链接等 -->
    <AppHeader />
    <!-- 主内容区域，slot 插槽用于渲染页面级组件内容 -->
    <main class="layout__content">
      <slot />
    </main>
    <!-- 页脚组件，包含版权信息等 -->
    <AppFooter />
  </div>
</template>

<script setup>
// 引入布局所需的公共组件
import AppHeader from '~/components/common/AppHeader.vue'  // 顶部导航栏组件
import AppFooter from '~/components/common/AppFooter.vue'  // 页脚组件
</script>

<style scoped>
/* 布局根容器：全屏高度，纵向弹性布局 */
.layout {
  min-height: 100vh;              /* 最小高度为视口高度，确保页脚始终在底部 */
  display: flex;                  /* 弹性布局 */
  flex-direction: column;         /* 纵向排列：Header → Content → Footer */
  background-color: var(--color-bg-primary);  /* 使用 CSS 变量设置主背景色 */
}

/* 主内容区域：自动填充导航栏和页脚之间的空间 */
.layout__content {
  flex: 1;                        /* 弹性增长因子为 1，占据剩余所有空间 */
  padding-top: 64px;              /* 顶部内边距，为固定导航栏留出空间（导航栏高度 64px） */
  min-height: calc(100vh - 64px); /* 最小高度确保内容区不会过短 */
}
</style>
