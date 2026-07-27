<!-- 默认布局 - 包含全局顶栏、主内容区和页脚 -->
<template>
  <div class="page-layout">
    <AppHeader />

    <main class="layout__content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.page-layout { 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

.layout__content {
  flex: 1;
  padding-top: 48px;
  min-height: calc(100vh - 64px);
}
</style>
