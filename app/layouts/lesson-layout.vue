<!-- 课时沉浸式布局 - 无 Header/Footer，专注学习 -->
<template>
  <div class="layout">
    <slot />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}
</style>
