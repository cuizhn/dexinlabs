<!-- 全局页脚 - 品牌标识与版权信息 -->
<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <div class="app-footer__brand">
        <span class="app-footer__logo">∑</span>
        <span class="app-footer__name">得心实验室</span>
        <p class="app-footer__desc">理解为先，应用为本。让学习真正得心应手。</p>
      </div>
    </div>

    <div class="app-footer__bottom">
      <div class="app-footer__bottom-container">
        <p class="app-footer__copyright">得心实验室 — 理解为先，应用为本</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--color-bg-white);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.app-footer__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.app-footer__brand {
  max-width: 280px;
}

.app-footer__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.app-footer__name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-left: var(--spacing-sm);
}

.app-footer__desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
  line-height: 1.6;
}

.app-footer__bottom {
  border-top: 1px solid var(--color-border-light);
}

.app-footer__bottom-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
}

.app-footer__copyright {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 768px) {
  .app-footer__container {
    padding: var(--spacing-xl) var(--spacing-md);
  }
}
</style>
