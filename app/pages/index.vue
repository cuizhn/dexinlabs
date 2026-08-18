<template>
  <div class="dexin-home">
    <main class="dexin-home__content">
    <!-- 第一屏：大量留白 + 一句产品定位 + 真实学习界面作为视觉主体 -->
    <section class="hero">
      <p class="hero__headline">理解，而不只是答案。</p>
      <p class="hero__sub">得心实验室 — 一个正在发生的数学学习过程</p>

      <HomeLessonPreview
        :title="previewLesson.title"
        :blocks="previewLesson.blocks"
      />
    </section>

    <!-- 横线 + 中央 logo 节点：页面「签名分隔」 -->
    <AppDivider with-mark />

    <!-- 正在验证：学习状态交互 -->
    <section class="section">
      <div class="section__inner">
        <h2 class="section__label">验证你的猜想</h2>
        <HomeVerifyPanel :scene="verifyScene" />
      </div>
    </section>

    <AppDivider />

    <!-- 正在理解：学习结论 -->
    <section class="section">
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

    <AppDivider />

    <!-- 知识地图：真实主题，近黑白文本列 -->
    <section class="section">
      <div class="section__inner">
        <h2 class="section__label">知识地图</h2>
        <HomeKnowledgeMap :topics="topicMap" />
      </div>
    </section>

    <AppDivider />

    <!-- 品牌说明 -->
    <section class="section">
      <div class="section__inner section__inner--narrow">
        <h2 class="section__label">关于得心实验室</h2>
        <p class="brand">
          我们相信，数学不是公式的堆砌，而是理解世界的一种方式。
        </p>
        <p class="brand brand--muted">
          让每一个概念，都从"为什么"开始。
        </p>
      </div>
    </section>

    <AppDivider />

    <!-- 继续探索 -->
    <section class="section section--cta">
      <div class="section__inner section__inner--narrow">
        <NuxtLink to="/courses" class="cta">
          进入课程
          <span class="cta__arrow" aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </section>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * 首页 — 现代学习工具视觉（近黑白 + 单一 Accent + 满屏宽结构线）
 *
 * 仅修改首页页面 / 首页组件 / 首页样式 / 首页静态展示数据。
 * 不改动：Lesson AST、LessonService、Content Engine、DB Schema、API、Renderer、
 * Course/Topic/Lesson 数据结构、登录系统、学习状态系统。
 *
 * 视觉规则（zed.dev 风格）：
 * - 不使用背景网格（无 repeating-linear-gradient 棋盘格）；
 * - 横向分隔线由 AppDivider 承担（满屏宽 1px 伪元素），section 自身零 border；
 * - 结构线不自动变成卡片；
 * - 真实 Lesson 内容通过现有 ContentRenderer 渲染（见 HomeLessonPreview）。
 */
import { previewLesson, verifyScene, topicMap } from '~/components/home/homeData'

useHead({
  title: '理解，而不只是答案'
})
</script>

<style scoped>
.dexin-home {
  /* ── 近黑白体系（得心实验室自有，非 Zed 色值）──
     指向全局 token，从而自动获得日夜主题能力；
     浅色下取值与原先的硬编码完全一致，首页视觉不变。 */
  --home-bg: var(--color-bg-primary);
  --home-fg: var(--color-text-primary); /* 近黑 */
  --home-secondary: var(--color-text-secondary);
  --home-muted: var(--color-text-muted);
  --home-border: var(--color-border);
  --home-surface: var(--color-bg-white);
  --home-surface-2: var(--color-bg-secondary);
  --home-accent: var(--color-primary); /* 唯一克制强调色 */
  --home-accent-soft: var(--color-primary-light);

  /* ── 字体层级 ── */
  --font-display: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* ── 字号层级 ── */
  --home-hero: clamp(2.4rem, 6vw, 4rem);
  --home-h2: 1.5rem;
  --home-body: 1.0625rem;
  --home-sm: 0.9375rem;
  --home-caption: 0.8125rem;

  /* ── 节奏 ── */
  --home-gap-section: clamp(4.5rem, 11vw, 8.5rem);
  --home-gap-block: clamp(2rem, 5vw, 3.5rem);

  width: 100%;
  position: relative;
  font-family: var(--font-ui);
  color: var(--home-fg);
  background: var(--home-bg);
}

.dexin-home__content {
  position: relative;
}

/* ── Hero：页面第一屏，下边界即第一条结构线 ── */
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

/* ── Section：自身零 border，横向分隔由 AppDivider 承担 ── */
.section {
  padding: var(--home-gap-section) var(--spacing-lg);
}

.section--cta {
  padding-top: clamp(2.5rem, 6vw, 4rem);
  padding-bottom: clamp(3.5rem, 8vw, 6rem);
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

/* ── 继续探索：文本链接，不做大按钮 ── */
.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--home-body);
  font-weight: 500;
  color: var(--home-fg);
  text-decoration: none;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--home-border);
  transition: border-color 0.2s ease, color 0.2s ease;
}

.cta:hover {
  color: var(--home-accent);
  border-bottom-color: var(--home-accent);
}

.cta__arrow {
  color: var(--home-muted);
  transition: color 0.2s ease, transform 0.2s ease;
}

.cta:hover .cta__arrow {
  color: var(--home-accent);
  transform: translateX(3px);
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

  .hero :deep(.preview__surface),
  .section :deep(.verify__surface) {
    border-radius: 6px;
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
