<template>
  <header class="header" :class="{ 'search-open': isSearchOpen }">

      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <img src="/logo.svg" alt="得心实验室" class="logo-image" />
      </NuxtLink>


      <!-- 全局搜索 -->
      <AppGlobalSearch ref="globalSearchRef" @update:is-open="isSearchOpen = $event" />

      <!-- 右侧操作区：主题切换 + 我的 -->
      <div class="actions">
        <!-- 日夜主题切换 -->
        <AppThemeToggle />

        <!-- 我的 -->
        <button class="icon-btn" aria-label="我的">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>

  </header>
</template>

<script setup lang="ts">
/**
 * 全局顶部导航栏
 *
 * 职责：
 * - 只负责全局 Header 布局和三个状态的切换
 * - 不包含搜索逻辑，搜索逻辑在 GlobalSearch 组件中
 *
 * 视觉：1px 结构线分隔，无阴影，中性黑白灰。
 *
 * 三个状态：
 * - Desktop / Default: Logo + Nav + GlobalSearch + 主题切换 + 我的
 * - Mobile / Default: Logo + Nav + 搜索图标 + 主题切换 + 我的
 * - Mobile / Search: 返回/关闭 + 搜索输入框（Logo 和右侧操作区隐藏）
 */

const isSearchOpen = ref(false)
const globalSearchRef = ref()
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
    width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  height: 48px;
  gap: var(--spacing-xl);
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
}



.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.logo-image {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-shrink: 0;
}

.nav-link {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: var(--color-text-primary);
}

/* 主题切换与「我的」同属图标操作区，彼此靠近成一组 */
.actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
  margin-left: auto;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 0.15s ease, background-color 0.15s ease;
}

.icon-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
    gap: var(--spacing-md);
  }

  .logo-text {
    display: none;
  }

  .nav {
    gap: var(--spacing-md);
  }

  .search-open .logo,
  .search-open .nav,
  .search-open .actions {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    font-size: var(--text-xl);
  }

  .nav {
    gap: var(--spacing-sm);
  }
}
</style>
