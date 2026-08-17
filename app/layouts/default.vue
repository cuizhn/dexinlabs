<!-- 默认布局 - 包含全局顶栏、主内容区和页脚 -->
<template>
  <div class="layout">
    <AppHeader />

    <main>
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: var(--spacing-2xl);
  min-height: calc(100vh - var(--spacing-2xl));
}
</style>
