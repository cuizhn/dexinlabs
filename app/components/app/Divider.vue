<template>
  <!--
    AppDivider — 满屏宽横向分隔线 + 三明治交汇节点（zed.dev 原版骨架复用）

    新版三明治骨架：
      [rail span: flex-1]     ← 弹性空白，border 画左竖线，内置 NodeMark 交汇点
      [center span: 980px]   ← 与 header/section 的内容容器同宽，承载中央签名节点
      [rail span: flex-1]     ← 弹性空白，border 画右竖线，内置 NodeMark 交汇点

    满屏宽横线继续使用 ::before/::after 伪元素 + -100vw/200vw 画线，
    与 rail span 的 border 竖线在 NodeMark 位置自然相交——节点无需绝对定位计算。
  -->
  <div class="app-divider" :class="{ 'app-divider--with-mark': withMark }" aria-hidden="true">
    <!-- 左竖线 + 交汇节点 -->
    <span class="app-divider__rail app-divider__rail--left">
      <span class="app-divider__node"><AppNodeMark /></span>
    </span>
    <!-- 中央签名节点（仅首条分隔用） -->
    <span v-if="withMark" class="app-divider__center">
      <span class="app-divider__node"><AppNodeMark /></span>
    </span>
    <!-- 中间透明占位，保证 rail 的宽度与 section 的内容容器严格一致 -->
    <span v-else class="app-divider__spacer"></span>
    <!-- 右竖线 + 交汇节点 -->
    <span class="app-divider__rail app-divider__rail--right">
      <span class="app-divider__node"><AppNodeMark /></span>
    </span>
  </div>
</template>

<script setup lang="ts">
/**
 * AppDivider — 满屏宽横线 + 三明治交汇节点
 *
 * 原理（与 zed.dev 完全一致）：
 * 1. 父容器 .app-divider 是 display:flex，三栏：
 *    - 左 rail（flex:1 border-right）→ 画左竖线 + 交汇节点
 *    - 中栏（max-width 980px，与 header/section 同宽）→ 承载中央签名
 *    - 右 rail（flex:1 border-left） → 画右竖线 + 交汇节点
 * 2. 横线用 ::before/::after 伪元素满屏宽画线，高度 14px 的 spacer
 *    上下各一条线，与上下 section 相邻
 * 3. NodeMark 在 rail span 内部 top:50% 居中，正好就是"横线穿过竖线"的交汇处
 *    —— 零 calc、零断点、零脆弱定位
 *
 * 用法：
 *   <AppDivider />             横线 + 两端交汇节点
 *   <AppDivider with-mark />   横线 + 两端交汇节点 + 中央签名节点（首条签名分隔）
 */
withDefaults(defineProps<{ withMark?: boolean }>(), { withMark: false })
</script>

<style scoped>
.app-divider {
  position: relative;
  height: 0.875rem; /* 14px = Tailwind h-3.5，仅承载横线 */
  width: 100%;
  display: flex;
  align-items: stretch;
}

/* ── 满屏宽横线 ── */
.app-divider::before,
.app-divider::after {
  content: '';
  position: absolute;
  left: -100vw;
  width: 200vw;
  height: 1px;
  background-color: var(--color-divider);
  pointer-events: none;
}

.app-divider::before { top: 0; }
.app-divider::after { bottom: 0; }

/* ── 弹性竖线 span ──
   flex:1 在 flex 容器中弹性分配两侧空白；
   border-right (左 span) / border-left (右 span) 画内容边缘的竖线；
   竖线位置完全由 flex 布局决定，与 Header / section 的 rail span 对齐。
   断点 1152px：确保大于所有内容容器的 max-width + padding*2，
   保证 rail 一旦显示就有剩余空间，不会出现"display:block 但 rail 0 宽"的死区。 */
.app-divider__rail {
  display: none;
  flex: 1 1 0%;
  position: relative;
  min-width: 0;
}

.app-divider__rail--left {
  border-right: 1px solid var(--color-border);
}

.app-divider__rail--right {
  border-left: 1px solid var(--color-border);
}

@media (min-width: 1152px) {
  .app-divider__rail {
    display: block;
  }
}

/* ── 交汇节点：在 rail span 内部，正好是横竖线的自然交点 ──
   横向：rail span 的竖线通过 border 画，NodeMark 在 rail 的 50% 宽处，
   即正好贴在竖线的 x 坐标上。
   纵向：rail span 高 14px，AppDivider 的横线在 top:0 / bottom:0，
   NodeMark 在 top:50%，正好位于上下两条横线的中间。
   NodeMark 的背景（--color-bg-primary）遮盖节点背后的横线，
   避免 logo 与横线重叠混乱。*/
.app-divider__node {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 3px;
  background-color: var(--color-bg-primary);
  line-height: 0;
  z-index: 1;
}

/* ── 中央签名节点 / 占位跨 ──
   width 等于内容层最大通用宽度（980px），max-width:100% 小屏不溢出。
   与 Header / Hero / section 的内容容器 width 完全一致 → 左右 rail 的 border-x
   坐标完全对齐。不要 width:100%，否则占满 flex 容器挤压 rail span 为 0 宽。 */
.app-divider__center,
.app-divider__spacer {
  flex: 0 1 auto;
  width: 980px;
  max-width: 100%;
  padding: 0 var(--spacing-lg);
  position: relative;
  margin: 0 auto;
  box-sizing: border-box;
  min-width: 0;
}

.app-divider__center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 中央签名节点：同理位于横线中心 */
.app-divider--with-mark .app-divider__center .app-divider__node {
  /* 已经居中，无需额外样式 */
}

/* 移动端：padding 变小，与 Header/section 同步 */
@media (max-width: 768px) {
  .app-divider__center,
  .app-divider__spacer {
    padding: 0 var(--spacing-md);
  }
}
</style>
