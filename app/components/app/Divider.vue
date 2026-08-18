<template>
  <div class="app-divider" :class="{ 'app-divider--with-mark': withMark }" aria-hidden="true">
    <!-- 左侧交汇点：横线与贯穿竖线的交点 -->
    <div class="app-divider__mark app-divider__mark--left">
      <AppNodeMark />
    </div>
    <!-- 中央签名节点（仅首条分隔用） -->
    <div v-if="withMark" class="app-divider__mark app-divider__mark--center">
      <AppNodeMark />
    </div>
    <!-- 右侧交汇点：横线与贯穿竖线的交点 -->
    <div class="app-divider__mark app-divider__mark--right">
      <AppNodeMark />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AppDivider — 满屏宽横向分隔线 + 交汇节点
 *
 * 设计语言来源：zed.dev
 * - 通过 ::before/::after 伪元素 + left:-100vw + width:200vw，
 *   让 1px 横线突破父容器宽度，延伸至浏览器左右边缘。
 * - 横线两端（与 layouts/default.vue 的贯穿竖线交汇处）各放一个 NodeMark，
 *   形成 zed.dev 风格的"网格节点"签名细节。
 * - with-mark 时中央额外放一个节点，用于首条签名分隔。
 *
 * 父容器必须 overflow-x: hidden（见 layouts/default.vue）。
 *
 * 用法：
 *   <AppDivider />             横线 + 两端交汇节点
 *   <AppDivider with-mark />   横线 + 两端交汇节点 + 中央签名节点
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
}

.app-divider::before { top: 0; }
.app-divider::after { bottom: 0; }

/* ── 交汇节点：对齐贯穿竖线位置 ──
   竖线由 layouts/default.vue 的 .layout__rails-inner 定位：
   - 视口 >= 980px：竖线在 calc(50% - 490px + padding) 处
   - 视口 < 980px：竖线在 padding 处（容器宽度=视口宽）
   - 移动端（<=768px）：padding 从 spacing-lg 变为 spacing-md */
.app-divider__mark {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  /* 节点周围用页面背景色遮盖线条中心，避免 logo 与线条重叠混乱 */
  padding: 3px;
  background-color: var(--color-bg-primary);
  line-height: 0;
}

.app-divider__mark--left {
  left: var(--spacing-lg);
}

.app-divider__mark--right {
  left: auto;
  right: var(--spacing-lg);
  transform: translate(50%, -50%);
}

.app-divider__mark--center {
  left: 50%;
}

/* 视口 >= 980px：竖线移到 980 容器的 padding 内侧 */
@media (min-width: 980px) {
  .app-divider__mark--left {
    left: calc(50% - 490px + var(--spacing-lg));
  }

  .app-divider__mark--right {
    right: calc(50% - 490px + var(--spacing-lg));
  }
}

/* 移动端：padding 变小 */
@media (max-width: 768px) {
  .app-divider__mark--left {
    left: var(--spacing-md);
  }

  .app-divider__mark--right {
    right: var(--spacing-md);
  }
}
</style>
