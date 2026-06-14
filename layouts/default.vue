<template>
  <!-- 默认布局：顶部导航 + 主内容区 + 页脚 -->
  <div class="layout">
    <AppHeader />
    <main class="layout__content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '~/components/common/AppHeader.vue'
import AppFooter from '~/components/common/AppFooter.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

.layout__content {
  flex: 1;
  padding-top: 64px;
  min-height: calc(100vh - 64px);
}
</style>
