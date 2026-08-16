<template>
  <header class="header" :class="{ 'search-open': isSearchOpen }">
    <div class="container">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <span class="logo-icon">
          <!-- 2. 浏览器标签图标 / Favicon 微型规格 (32px) -->
<svg
  xmlns="http://w3.org"
  viewBox="0 0 1024 1024"
  width="32"
  height="32"
  fill="none"
  preserveAspectRatio="xMidYMid meet"
>
  <!-- X — 第一笔基础斜线（圆角空心双线轨道结构） -->
  <path d="M 220 180 L 804 844" stroke="#0B2742" stroke-width="96" stroke-linecap="round" />
  <path d="M 220 180 L 804 844" stroke="white" stroke-width="42" stroke-linecap="round" />

  <!-- X — 第二笔：空心铅笔笔杆主体 -->
  <path d="M 252 795 L 772 231" stroke="#0B2742" stroke-width="96" stroke-linecap="butt" />
  <path d="M 252 795 L 772 231" stroke="white" stroke-width="42" stroke-linecap="butt" />

  <!-- 纯线框笔尖组件（无石墨笔芯） -->
  <path d="M 216 763 L 288 827 L 202 851 Z" fill="#0B2742" />
  <path d="M 226 772 L 274 815 L 212 833 Z" fill="white" />

  <!-- 右上方旋转空心橡皮擦 -->
  <g transform="translate(772 231) rotate(-48)">
    <rect x="0" y="-48" width="112" height="96" rx="28" fill="#0B2742" />
    <rect x="20" y="-27" width="72" height="54" rx="16" fill="white" />
  </g>
</svg>


</span>
        <span class="logo-text">得心实验室</span>
      </NuxtLink>

      <!-- 极简导航 -->
      <nav class="nav" aria-label="主导航">
        <NuxtLink to="/courses" class="nav-link">课程</NuxtLink>
        <NuxtLink to="/about" class="nav-link">关于</NuxtLink>
      </nav>

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
 * 视觉：1px 结构线分隔，无阴影，中性黑白灰。
 *
 * 三个状态：
 * - Desktop / Default: Logo + Nav + GlobalSearch + 我的
 * - Mobile / Default: Logo + Nav + 搜索图标 + 我的
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
}

.container {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
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
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.logo-icon {
  font-size: var(--text-2xl);
  font-weight: 700;
}

.logo-text {
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: 0.01em;
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

.user {
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
  .search-open .user {
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
