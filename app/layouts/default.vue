<!-- 默认布局 - 包含全局顶栏、主内容区和页脚 -->
<template>
  <div class="layout">
    <AppHeader />

    <main>
      <slot />
    </main>
    <AppFooter />

    <!-- 贯穿竖线：从 Header logo 左侧 / button 右侧往下到 Footer
         与 AppDivider 满屏宽横线交汇形成网格，交汇点由 AppDivider 的 NodeMark 标记 -->
    <div class="layout__rails" aria-hidden="true">
      <div class="layout__rails-inner"></div>
    </div>
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

/* ── 贯穿竖线（zed.dev 面板外框风格）──
   位置对齐 Header .header__inner 的内容边缘：
   - 同样的 max-width 980px + padding，使竖线落在 logo 左侧 / button 右侧
   - fixed 贯穿整个视口，从顶到底（覆盖 Header + main + Footer）
   - z-index 高于 Header（100），但 pointer-events:none 不挡交互
   - 竖线只在 padding 区（无内容），不会遮盖 Header 实际内容 */
.layout__rails {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 200;
}

.layout__rails-inner {
  max-width: 980px;
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--spacing-lg);
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .layout__rails-inner {
    padding: 0 var(--spacing-md);
  }
}
</style>
