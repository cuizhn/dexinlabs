<template>
  <header class="header" :class="{ 'search-open': isSearchOpen }">
    <!--
      zed.dev 三明治布局：
      [flex-1 span 画左边线] ← 弹性空白，落在内容区左侧边缘
      [header__inner 居中限宽 980px + 实际内容]
      [flex-1 span 画右边线] ← 弹性空白，落在内容区右侧边缘

      span 的 border-x 画出左右两条竖线，与下方 section 的同名竖线连续。
      小屏隐藏（hidden），大屏显示（lg:block），仿 zed.dev 的响应式策略。
    -->
    <span class="header__rail" aria-hidden="true"></span>
    <div class="header__inner">
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
    </div>
    <span class="header__rail" aria-hidden="true"></span>
  </header>
</template>

<script setup lang="ts">
/**
 * 全局顶部导航栏 — zed.dev 三明治布局
 *
 * 职责：
 * - 只负责全局 Header 布局和三个状态的切换
 * - 不包含搜索逻辑，搜索逻辑在 GlobalSearch 组件中
 *
 * 视觉（zed.dev 三明治模式）：
 * - Header 自身是 flex 容器（display: flex），
 * - 左右各一个 <span class="header__rail"> 作为弹性空白（flex:1），
 *   并通过 border-left / border-right 画出与下方 section 连续的两条竖线；
 * - 中间 .header__inner 限宽 980px 居中，承载实际内容；
 * - Header 下边线（border-bottom）与内容区无关；
 * - 竖线在大屏（lg >= 1024px）显示，小屏隐藏。
 */

const isSearchOpen = ref(false)
const globalSearchRef = ref()
</script>

<style scoped>
/* ── Header 外层：flex 三明治容器 ── */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  display: flex;
  align-items: stretch;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
}

/* ── 弹性空白 span：flex-1 自动占两侧空间，并画内容边缘的单边竖线 ──
   与 index.vue / Divider.vue 的 rail span 保持完全同构：
   - flex:1 在 flex 容器中弹性分配两侧空白
   - 左 rail 只画 border-right（内容区左边缘的竖线）
   - 右 rail 只画 border-left（内容区右边缘的竖线）
   - 整条竖线从 Header 顶部开始，与下方 section 的 rail border 视觉连续
   - 默认 display:none，大屏 (>=1024px) block 显示 */
.header__rail {
  display: none;
  flex: 1 1 0%;
  position: relative;
}

.header__rail:first-child {
  border-right: 1px solid var(--color-border);
}

.header__rail:last-child {
  border-left: 1px solid var(--color-border);
}

@media (min-width: 1024px) {
  .header__rail {
    display: block;
  }
}

/* ── 内容容器：限宽 980px + padding 与旧版保持一致 ── */
.header__inner {
  width: 100%;
  max-width: 980px;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  height: 48px;
  gap: var(--spacing-xl);
  flex: 0 1 auto;
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
  .header__inner {
    padding: 0 var(--spacing-md);
    gap: var(--spacing-md);
  }

  .search-open .header__inner > * {
    display: none;
  }
}

@media (max-width: 480px) {
  .header__inner {
    gap: var(--spacing-sm);
  }
}
</style>
