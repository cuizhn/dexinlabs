<template>
  <button
    class="theme-toggle"
    type="button"
    aria-label="切换深色 / 浅色主题"
    @click="toggle"
  >
    <!-- 浅色状态显示月亮：图标表示"点击后进入"的状态 -->
    <svg
      class="icon icon-moon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>

    <!-- 深色状态显示太阳 -->
    <svg
      class="icon icon-sun"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="m4.93 19.07 1.41-1.41" />
      <path d="m17.66 6.34 1.41-1.41" />
    </svg>
  </button>
</template>

<script setup lang="ts">
/**
 * 日夜主题切换按钮
 *
 * 职责：只负责"点击切换主题"这一件事，主题状态与持久化在 useTheme 中。
 *
 * 视觉：与 Header 其他图标按钮完全一致（36×36、无边框、hover 浅底），
 * 不带文字标签，保持极简工具感。
 *
 * 图标形态由 CSS 依据 <html data-theme> 决定，而不是依赖组件状态：
 * SSR 无法得知用户主题，若用 v-if 会在水合瞬间出现图标跳变。
 */
import { useTheme } from '~/composables/useTheme'
const { toggle } = useTheme()
</script>

<style scoped>
.theme-toggle {
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

.theme-toggle:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.icon {
  display: block;
}

/* 浅色（默认）：显示月亮 */
.icon-sun {
  display: none;
}

/* 深色：显示太阳 */
:root[data-theme='dark'] .icon-moon {
  display: none;
}

:root[data-theme='dark'] .icon-sun {
  display: block;
}
</style>
