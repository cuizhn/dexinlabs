<!-- 全局页脚 - 品牌标识与版权信息 -->
<template>
  <footer class="footer">
    <div class="container">
      <div class="brand">
        <span class="logo">∑</span>
        <span class="name">得心实验室</span>
        <p class="desc">理解为先，应用为本。让学习真正得心应手。</p>
      </div>
    </div>

    <div class="bottom">
      <div class="container">
        <p class="copyright">得心实验室 — 理解为先，应用为本</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-bg-white);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.brand {
  max-width: 280px;
}

.logo {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-primary);
}

.name {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-left: var(--spacing-sm);
}

.desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
  line-height: 1.6;
}

.bottom {
  border-top: 1px solid var(--color-border-light);
}

.bottom .container {
  padding: var(--spacing-md) var(--spacing-lg);
}

.copyright {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 768px) {
  .container {
    padding: var(--spacing-xl) var(--spacing-md);
  }
}
</style>
