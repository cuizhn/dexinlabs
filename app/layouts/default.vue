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
  /* 满屏宽横线（AppDivider 的 -100vw/200vw 伪元素）依赖此层剪裁；
     用 clip 而非 hidden：clip 不会创建滚动容器，避免破坏 Header 的 sticky 行为 */
  overflow-x: clip;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* Header 改 sticky 后已占文档流，这里只保留 Header 与内容的呼吸距离 */
  padding-top: var(--spacing-lg);
  min-height: calc(100vh - var(--spacing-lg));
}
</style>
