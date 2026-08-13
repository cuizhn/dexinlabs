<template>
  <header class="header" :class="{ 'search-open': isSearchOpen }">
    <div class="container">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <span class="logo-icon">∑</span>
        <span class="logo-text">得心实验室</span>
      </NuxtLink>

      <!-- 全局搜索 -->
      <AppGlobalSearch ref="globalSearchRef" @update:is-open="isSearchOpen = $event" />

      <!-- 我的 -->
      <div class="user">
        <button class="icon-btn" aria-label="我的">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>
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
 * 三个状态：
 * - Desktop / Default: Logo + GlobalSearch + 我的
 * - Mobile / Default: Logo + 搜索图标 + 我的
 * - Mobile / Search: 返回/关闭 + 搜索输入框（Logo 和"我的"隐藏）
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
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.container {
  width: 100%;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  height: 64px;
  gap: var(--spacing-xl);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--color-primary);
  flex-shrink: 0;
}

.logo-icon {
  font-size: var(--text-2xl);
  font-weight: 700;
}

.logo-text {
  font-size: var(--text-xl);
  font-weight: 700;
}

.user {
  flex-shrink: 0;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
    gap: var(--spacing-md);
  }

  .logo-text {
    display: none;
  }

  .search-open .logo,
  .search-open .user {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    font-size: var(--text-xl);
  }
}
</style>
