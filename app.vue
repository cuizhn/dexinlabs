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

<script setup>
// 根组件：设置全局 head 信息
// useHead 是 Nuxt 提供的组合式函数，用于动态管理 HTML <head> 内容
useHead({
  // 标题模板：%s 会被页面级 useHead 设置的 title 替换
  // 例如：页面设置 title 为 '代数入门'，最终显示为 '代数入门 - Edu Platform'
  titleTemplate: '%s - Edu Platform',
  meta: [
    // 全局 SEO 描述，所有页面共享（页面级可覆盖）
    { name: 'description', content: '数学学习平台，从基础到高级，让数学变得简单' },
  ],
})
</script>
