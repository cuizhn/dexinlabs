<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// 根组件：设置全局 head 信息
useHead({
  titleTemplate: '%s - Edu Platform',
  meta: [
    { name: 'description', content: '数学学习平台，从基础到高级，让数学变得简单' },
  ],
})
</script>
