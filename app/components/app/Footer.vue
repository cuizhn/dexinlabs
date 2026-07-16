<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <div class="app-footer__brand">
        <span class="app-footer__logo">∑</span>
        <span class="app-footer__name">Dexin Labs</span>
        <p class="app-footer__desc">理解为先，应用为本。让学习真正得心应手。</p>
      </div>

      <div class="app-footer__links">
        <div class="app-footer__group">
          <h4 class="app-footer__group-title">开始学习</h4>
          <NuxtLink to="/study" class="app-footer__link">同步学习</NuxtLink>
          <NuxtLink to="/course" class="app-footer__link">课程中心</NuxtLink>
          <NuxtLink to="/methods" class="app-footer__link">学习方法</NuxtLink>
        </div>

        <div class="app-footer__group">
          <h4 class="app-footer__group-title">关于</h4>
          <NuxtLink to="/about" class="app-footer__link">品牌故事</NuxtLink>
          <NuxtLink to="/course" class="app-footer__link">联系与反馈</NuxtLink>
        </div>
      </div>
    </div>

    <div class="app-footer__bottom">
      <div class="app-footer__bottom-container">
        <p class="app-footer__copyright">Dexin Labs · 得心实验室 — 理解为先，应用为本</p>
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
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-2xl);
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

.app-footer__links {
  display: flex;
  gap: var(--spacing-2xl);
}

.app-footer__group-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.app-footer__link {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--spacing-xs) 0;
  transition: color 0.2s ease;
}

.app-footer__link:hover {
  color: var(--color-primary);
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

@markdowndia (max-width: 768px) {
  .app-footer__container {
    flex-direction: column;
    gap: var(--spacing-xl);
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .app-footer__links {
    gap: var(--spacing-xl);
  }
}
</style>
