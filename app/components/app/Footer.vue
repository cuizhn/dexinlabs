<!-- 全局页脚 - 品牌标识、导航与版权信息 -->
<template>
  <footer class="footer">
    <div class="container">
      <div class="brand">
        <span class="logo">∑</span>
        <span class="name">得心实验室</span>
        <p class="desc">理解为先，应用为本。让学习真正得心应手。</p>
      </div>

      <nav class="links" aria-label="页脚导航">
        <NuxtLink to="/courses" class="link">课程</NuxtLink>
        <NuxtLink to="/about" class="link">关于</NuxtLink>
        <NuxtLink to="/privacy" class="link">隐私政策</NuxtLink>
        <NuxtLink to="/minors" class="link">未成年人保护</NuxtLink>
      </nav>
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
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  margin-top: auto;
}

.container {
  max-width: 980px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.brand {
  max-width: 280px;
}

.logo {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-left: var(--spacing-sm);
}

.desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
  line-height: 1.6;
}

.links {
  display: flex;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.link {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.link:hover {
  color: var(--color-text-primary);
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
    flex-direction: column;
    gap: var(--spacing-lg);
  }
}
</style>
