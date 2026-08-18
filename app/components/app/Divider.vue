<template>
  <div class="app-divider" :class="{ 'app-divider--with-mark': withMark }" aria-hidden="true">
    <div v-if="withMark" class="app-divider__mark">
      <AppNodeMark />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AppDivider — 满屏宽横向分隔线
 *
 * 设计语言来源：zed.dev
 * 通过 ::before/::after 伪元素 + left:-100vw + width:200vw，
 * 让 1px 横线突破父容器宽度，延伸至浏览器左右边缘。
 *
 * 父容器必须 overflow-x: hidden（见 layouts/default.vue），
 * 否则会触发横向滚动条。
 *
 * 用法：
 *   <AppDivider />             仅满屏宽横线
 *   <AppDivider with-mark />   横线中央带 logo 节点（首尾分隔用）
 */
withDefaults(defineProps<{ withMark?: boolean }>(), { withMark: false })
</script>

<style scoped>
.app-divider {
  position: relative;
  height: 0.875rem; /* 14px = Tailwind h-3.5，仅承载横线 */
  width: 100%;
}

.app-divider::before,
.app-divider::after {
  content: '';
  position: absolute;
  left: -100vw;
  width: 200vw;
  height: 1px;
  background-color: var(--color-divider);
  z-index: -1; /* 沉到内容下方 */
}

.app-divider::before { top: 0; }
.app-divider::after { bottom: 0; }

.app-divider__mark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  /* 节点周围用页面背景色遮盖线条中心，避免 logo 与线条重叠混乱 */
  padding: 3px;
  background-color: var(--color-bg-primary);
  line-height: 0;
}
</style>
