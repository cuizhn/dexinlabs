<!--
  AppFooter 组件 - 页脚
  功能说明：
  - 页面底部页脚区域，包含品牌信息、链接分组和版权信息
  - 品牌区域展示 Logo、平台名称和简介
  - 链接分组区域按类别展示导航链接（课程、学习等）
  - 底部展示版权信息
  - 移动端（≤768px）自动切换为垂直布局
-->
<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <!-- 品牌信息区域：Logo、平台名称、简介 -->
      <div class="app-footer__brand">
        <span class="app-footer__logo">∑</span>
        <span class="app-footer__name">Dexin Labs</span>
        <p class="app-footer__desc">理解为先，应用为本。让学习真正得心应手。</p>
      </div>

      <!-- 链接分组区域：按类别组织的导航链接 -->
      <div class="app-footer__links">
        <!-- 学习分组 -->
        <div class="app-footer__group">
          <h4 class="app-footer__group-title">开始学习</h4>
          <NuxtLink to="/study" class="app-footer__link">同步学习</NuxtLink>
          <NuxtLink to="/course" class="app-footer__link">课程中心</NuxtLink>
          <NuxtLink to="/methods" class="app-footer__link">学习方法</NuxtLink>
        </div>
        <!-- 关于分组 -->
        <div class="app-footer__group">
          <h4 class="app-footer__group-title">关于</h4>
          <NuxtLink to="/about" class="app-footer__link">品牌故事</NuxtLink>
          <NuxtLink to="/course" class="app-footer__link">联系与反馈</NuxtLink>
        </div>
      </div>
    </div>

    <!-- 底部版权信息区域 -->
    <div class="app-footer__bottom">
      <div class="app-footer__bottom-container">
        <p class="app-footer__copyright">Dexin Labs · 得心实验室 — 理解为先，应用为本</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* 页脚容器：白色背景、顶部边框、自动顶部外边距（用于 flex 布局推到底部） */
.app-footer {
  background-color: var(--color-bg-white);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

/* 页脚内容容器：限制最大宽度、水平布局、两端对齐 */
.app-footer__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-2xl);
}

/* 品牌信息区域：限制最大宽度 */
.app-footer__brand {
  max-width: 280px;
}

/* 品牌 Logo 样式 */
.app-footer__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* 品牌名称样式 */
.app-footer__name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-left: var(--spacing-sm);
}

/* 品牌简介文字样式 */
.app-footer__desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
  line-height: 1.6;
}

/* 链接分组容器：水平排列各分组 */
.app-footer__links {
  display: flex;
  gap: var(--spacing-2xl);
}

/* 链接分组标题样式 */
.app-footer__group-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

/* 分组内链接样式：垂直排列、带悬停变色效果 */
.app-footer__link {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--spacing-xs) 0;
  transition: color 0.2s ease;
}

/* 链接悬停样式：变为主题色 */
.app-footer__link:hover {
  color: var(--color-primary);
}

/* 底部版权区域：顶部细分隔线 */
.app-footer__bottom {
  border-top: 1px solid var(--color-border-light);
}

/* 底部版权内容容器 */
.app-footer__bottom-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
}

/* 版权文字样式：居中、小字号、弱化颜色 */
.app-footer__copyright {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: center;
}

/* 响应式：平板及以下屏幕切换为垂直布局 */
@media (max-width: 768px) {
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
