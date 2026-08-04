<!-- 默认布局 - 包含全局顶栏、主内容区和页脚 -->
<template>
  <div class="app-layout">
    <AppHeader />

    <main class="layout__content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-layout { 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

main {
  flex: 1;
  padding-top: 48px;
  min-height: calc(100vh - 48px);
  display: flex;
  margin: 0 auto;
}
</style>
