<!--
  根组件 (app.vue)
  功能说明：
  本文件是 Nuxt 应用的根组件，是整个页面渲染的入口。
  主要职责：
  - 提供全局布局容器（NuxtLayout），所有页面共享同一布局
  - 提供页面路由出口（NuxtPage），根据当前路由渲染对应页面组件
  - 设置全局 HTML Head 信息（标题模板、SEO 描述等）
-->
<template>
  <!-- 应用根容器 -->
  <div id="app">
    <!-- NuxtLayout：布局组件，根据路由匹配对应的布局文件（默认使用 layouts/default.vue） -->
    <NuxtLayout>
      <!-- NuxtPage：页面路由出口，根据当前 URL 渲染对应的页面组件 -->
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (title?: string) =>
    title ? `${title} · Dexin Labs` : 'Dexin Labs · 得心实验室',
  meta: [
    {
      name: 'description',
      content:
        '理解为先，应用为本。Dexin Labs（得心实验室）— 让数学学习真正得心应手。K12 数学思维学习平台。',
    },
  ],
})
</script>
