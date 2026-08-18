<template>
  <!--
    Logo 节点标记 — 用于横线交汇处或需要节点装饰的位置。
    纯展示组件，不包含定位逻辑（定位由父级控制）。
    颜色通过 currentColor 跟随主题，默认取 --color-text-muted（克制不抢戏）。
  -->
  <svg class="node-mark" viewBox="-12 -12 124 124" fill="none" aria-hidden="true">
    <path d="M0 0 L33.282 33.282 M66.095 33.282 L99.377 0 M0 99.377 L33.282 66.095 M66.095 66.095 L99.377 99.377"
          stroke="currentColor"
          stroke-width="16.875"
          stroke-linecap="round"/>
  </svg>
</template>

<script setup lang="ts">
/**
 * AppNodeMark — Logo X 标记节点
 *
 * 视觉来源：从 public/logo.svg 抽出的 X 几何标记，
 * 用以替换 zed.dev 的"旋转 45° 方块"装饰节点，
 * 让横竖线交汇处的精致节点承载品牌识别。
 *
 * 尺寸默认 12px，外部可通过 CSS 覆盖 .node-mark 的 width/height。
 */
</script>

<style scoped>
.node-mark {
  display: block;
  width: 12px;
  height: 12px;
  color: var(--color-text-muted);
  pointer-events: none;
  user-select: none;
}
</style>
