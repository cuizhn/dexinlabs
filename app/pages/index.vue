<template>
  <div class="dexin-home">
    <!-- 背景结构线：统一坐标系统，位于内容最底层 -->
    <div class="dexin-home__grid" aria-hidden="true"></div>

    <main class="dexin-home__content">
    <!-- 第一屏：巨大留白 + 一句产品定位 + 真实学习界面作为视觉主体 -->
    <section class="hero">
      <p class="hero__headline">理解，而不只是答案。</p>
      <p class="hero__sub">得心实验室 — 一个正在发生的数学学习过程</p>

      <HomeLessonPreview
        :title="previewLesson.title"
        :blocks="previewLesson.blocks"
      />
    </section>

    <!-- 正在验证：学习状态交互 -->
    <section class="section">
      <div class="section__inner">
        <h2 class="section__label">验证你的猜想</h2>
        <HomeVerifyPanel :scene="verifyScene" />
      </div>
    </section>

    <!-- 正在理解：学习结论 -->
    <section class="section section--alt">
      <div class="section__inner section__inner--narrow">
        <p class="state-chip">正在理解</p>
        <p class="understand">
          当一个量随另一个量按照某种规则变化，它们之间就建立了一种关系。
        </p>
        <p class="understand understand--lead">
          我们把它叫做——<span class="accent">函数</span>。
        </p>
      </div>
    </section>

    <!-- 知识地图：真实主题，近黑白文本列 -->
    <section class="section">
      <div class="section__inner">
        <h2 class="section__label">知识地图</h2>
        <HomeKnowledgeMap :topics="topicMap" />
      </div>
    </section>

    <!-- 品牌说明 -->
    <section class="section section--alt">
      <div class="section__inner section__inner--narrow">
        <h2 class="section__label">关于得心实验室</h2>
        <p class="brand">
          我们相信，数学不是公式的堆砌，而是理解世界的一种方式。
        </p>
        <p class="brand brand--muted">
          让每一个概念，都从“为什么”开始。
        </p>
      </div>
    </section>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * 首页 — Zed 风格视觉实验（独立实验场）
 *
 * 仅修改首页页面 / 首页组件 / 首页样式 / 首页静态展示数据。
 * 不改动：Lesson AST、LessonService、Content Engine、DB Schema、API、Renderer、
 * Course/Topic/Lesson 数据结构、登录系统、学习状态系统。
 *
 * 设计系统完全作用域在 .dexin-home 之下，不影响其他页面（lesson/course/topic）。
 * 真实 Lesson 内容通过现有 ContentRenderer 渲染（见 HomeLessonPreview）。
 */
import { previewLesson, verifyScene, topicMap } from '~/components/home/homeData'

useHead({
  title: '理解，而不只是答案'
})
</script>

<style scoped>
.dexin-home {
  /* ── 近黑白体系（得心实验室自有，非 Zed 色值）── */
  --home-bg: #fbfbfa;
  --home-fg: #18181b; /* 近黑 */
  --home-secondary: #52525b;
  --home-muted: #a1a1aa;
  --home-border: #e4e4e7;
  --home-surface: #ffffff;
  --home-surface-2: #f4f4f5;
  --home-accent: #3b6fe0; /* 唯一克制强调色 */
  --home-accent-soft: rgba(59, 111, 224, 0.08);

  /* ── 字体层级 ── */
  --font-display: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-heading: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-ui: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-math: 'STIX Two Math', 'Times New Roman', serif;

  /* ── 字号层级 ── */
  --home-hero: clamp(2.4rem, 6vw, 4rem);
  --home-h1: 2rem;
  --home-h2: 1.5rem;
  --home-body: 1.0625rem;
  --home-sm: 0.9375rem;
  --home-caption: 0.8125rem;

  /* ── 节奏 ── */
  --home-gap-section: clamp(4.5rem, 11vw, 8.5rem);
  --home-gap-block: clamp(2rem, 5vw, 3.5rem);

  width: 100%;
  position: relative;
  font-family: var(--font-body);
  color: var(--home-fg);
  background: var(--home-bg);

  /* ── 背景结构线（统一坐标系统，极克制）── */
  --grid-line: rgba(24, 24, 27, 0.035);        /* 普通结构线：极低对比度 */
  --grid-line-strong: rgba(24, 24, 27, 0.06);  /* 强结构线：仅框架 / 分界 */
  --grid-background: transparent;
  --grid-rhythm: 128px;                        /* 横向参考线节奏 */
}

/* ── 背景结构线：统一坐标系统，位于内容最底层，不参与布局 ── */
.dexin-home__grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  max-width: 980px;
  margin: 0 auto;
  pointer-events: none;
  border-left: 1px solid var(--grid-line-strong);
  border-right: 1px solid var(--grid-line-strong);
  background-color: var(--grid-background);
  background-image:
    /* 中线：极低对比度 */
    linear-gradient(
      to right,
      transparent calc(50% - 0.5px),
      var(--grid-line) calc(50% - 0.5px),
      var(--grid-line) calc(50% + 0.5px),
      transparent calc(50% + 0.5px)
    ),
    /* 横向参考线节奏 */
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent calc(var(--grid-rhythm) - 1px),
      var(--grid-line) calc(var(--grid-rhythm) - 1px),
      var(--grid-line) var(--grid-rhythm)
    );
}

/* 内容浮于背景结构线之上 */
.dexin-home__content {
  position: relative;
  z-index: 1;
}

/* ── Hero ── */
.hero {
  max-width: 980px;
  margin: 0 auto;
  padding: clamp(3.5rem, 9vw, 7rem) var(--spacing-lg) var(--home-gap-section);
  text-align: center;
  animation: fadeUp 0.45s ease both;
}

.hero__headline {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--home-hero);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: var(--home-fg);
}

.hero__sub {
  margin: 1.25rem 0 0;
  font-size: var(--home-body);
  font-weight: 400;
  color: var(--home-secondary);
  letter-spacing: 0.01em;
}

.hero :deep(.preview) {
  margin-top: var(--home-gap-block);
  text-align: left;
}

/* ── Section 通用 ── */
.section {
  padding: var(--home-gap-section) var(--spacing-lg);
}

.section--alt {
  background: transparent; /* 透明，让统一背景结构线贯穿整页 */
}

.section__inner {
  max-width: 860px;
  margin: 0 auto;
}

.section__inner--narrow {
  max-width: 680px;
}

.section__label {
  margin: 0 0 var(--home-gap-block);
  font-size: var(--home-caption);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--home-muted);
}

/* ── 正在理解 ── */
.state-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.25rem;
  font-size: var(--home-caption);
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--home-secondary);
}

.state-chip::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--home-accent);
}

.understand {
  margin: 0;
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.015em;
  color: var(--home-fg);
}

.understand--lead {
  margin-top: 1.5rem;
}

.accent {
  color: var(--home-accent);
}

/* ── 品牌说明 ── */
.brand {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.01em;
  color: var(--home-fg);
}

.brand--muted {
  margin-top: 1rem;
  font-size: var(--home-h2);
  font-weight: 400;
  color: var(--home-secondary);
}

/* ── 动效：仅 opacity / transform，轻量 ── */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .hero {
    padding: clamp(2.5rem, 8vw, 4rem) var(--spacing-md) var(--home-gap-section);
  }

  .section {
    padding: var(--home-gap-section) var(--spacing-md);
  }

  .hero :deep(.preview),
  .section__label {
    /* 移动端适当减少留白，但保持节奏 */
  }

  .hero :deep(.preview__surface),
  .section :deep(.verify__surface) {
    border-radius: 6px;
  }

  /* 移动端：减少纵向线（去中线）+ 横向参考线更稀疏，避免视觉噪声 */
  .dexin-home__grid {
    --grid-rhythm: 200px;
    background-image:
      repeating-linear-gradient(
        to bottom,
        transparent 0,
        transparent calc(var(--grid-rhythm) - 1px),
        var(--grid-line) calc(var(--grid-rhythm) - 1px),
        var(--grid-line) var(--grid-rhythm)
      );
    border-left-color: var(--grid-line);
    border-right-color: var(--grid-line);
  }
}

@media (max-width: 480px) {
  .hero__headline {
    font-size: clamp(2rem, 9vw, 2.6rem);
  }

  .hero__sub {
    font-size: var(--home-sm);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero {
    animation: none;
  }
}
</style>
