<template>
  <div class="dexin-home">
    <main class="dexin-home__content">
      <!-- ── Hero：定位 + 双 CTA + 真实学习界面 ── -->
      <section class="hero">
        <p class="hero__kicker">得心实验室</p>
        <h1 class="hero__headline">理解，而不只是答案。</h1>
        <p class="hero__sub">一个正在发生的数学学习过程</p>

        <div class="hero__cta">
          <NuxtLink to="/courses" class="cta-primary">
            开始学习
            <span class="cta-primary__arrow" aria-hidden="true">→</span>
          </NuxtLink>
          <NuxtLink to="/about" class="cta-secondary">
            了解我们
          </NuxtLink>
        </div>

        <HomeLessonPreview
          :title="previewLesson.title"
          :blocks="previewLesson.blocks"
        />
      </section>

      <!-- 横线 + 中央 logo 节点：页面签名分隔 -->
      <AppDivider with-mark />

      <!-- 学习理念：三联多列网格 -->
      <section class="section">
        <div class="section__inner section__inner--wide">
          <h2 class="section__label">三个学习理念</h2>
          <HomeFeatures />
        </div>
      </section>

      <AppDivider />

      <!-- 验证猜想：交互 -->
      <section class="section">
        <div class="section__inner">
          <h2 class="section__label">验证你的猜想</h2>
          <HomeVerifyPanel :scene="verifyScene" />
        </div>
      </section>

      <AppDivider />

      <!-- 学习路径：认知顺序时间线 -->
      <section class="section">
        <div class="section__inner section__inner--narrow">
          <h2 class="section__label">学习路径</h2>
          <HomeLearningPath />
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

      <!-- 知识地图：真实主题 -->
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

      <!-- 结尾大号 CTA：入口选择 -->
      <section class="section section--final-cta">
        <div class="section__inner section__inner--narrow">
          <h2 class="final-cta__title">准备好开始了吗？</h2>
          <p class="final-cta__sub">从一个"为什么"出发，找到你自己的答案。</p>
          <div class="final-cta__actions">
            <NuxtLink to="/courses" class="cta-primary cta-primary--lg">
              进入课程
              <span class="cta-primary__arrow" aria-hidden="true">→</span>
            </NuxtLink>
            <NuxtLink to="/about" class="cta-secondary">
              了解我们
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * 首页 — zed.dev 风格内容区重构
 *
 * 内容区按 zed.dev 布局语言重新组织：
 * - Hero 双 CTA（主链接 + 次链接，仿 zed 文本按钮风格）
 * - 三联特性区（WHY/WHAT/HOW 多列网格）
 * - 学习路径时间线（认知顺序，仿 zed agent 任务流）
 * - 结尾大号 CTA 区（带入口选择）
 *
 * 不改动：Lesson AST、LessonService、Content Engine、DB Schema、API、Renderer。
 */
import { previewLesson, verifyScene, topicMap } from '~/components/home/homeData'

useHead({
  title: '理解，而不只是答案'
})
</script>

<style scoped>
.dexin-home {
  /* ── 近黑白体系（指向全局 token，自动获得日夜主题能力）── */
  --home-bg: var(--color-bg-primary);
  --home-fg: var(--color-text-primary);
  --home-secondary: var(--color-text-secondary);
  --home-muted: var(--color-text-muted);
  --home-border: var(--color-border);
  --home-surface: var(--color-bg-white);
  --home-surface-2: var(--color-bg-secondary);
  --home-accent: var(--color-primary);
  --home-accent-soft: var(--color-primary-light);

  --font-display: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --home-hero: clamp(2.4rem, 6vw, 4rem);
  --home-h2: 1.5rem;
  --home-body: 1.0625rem;
  --home-sm: 0.9375rem;
  --home-caption: 0.8125rem;

  --home-gap-section: clamp(4.5rem, 11vw, 8.5rem);
  --home-gap-block: clamp(2rem, 5vw, 3.5rem);

  width: 100%;
  position: relative;
  font-family: var(--font-ui);
  color: var(--home-fg);
  background: var(--home-bg);
}

/* ── 内容区外围两条贯穿竖线（zed.dev 面板外框风格）──
   竖线把所有 section "框住"，与 AppDivider 的满屏宽横线交汇成网格。
   宽度 1200px，居中，两侧各 1px 竖线。 */
.dexin-home__content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  min-height: 100vh;
  background: var(--home-bg);
}

@media (max-width: 768px) {
  /* 移动端窄屏：移除外围竖线，避免内容被压窄 */
  .dexin-home__content {
    max-width: 100%;
    border-left: none;
    border-right: none;
  }
}

/* ── Hero ── */
.hero {
  max-width: 980px;
  margin: 0 auto;
  padding: clamp(3.5rem, 9vw, 7rem) var(--spacing-lg) var(--home-gap-section);
  text-align: center;
  animation: fadeUp 0.45s ease both;
}

.hero__kicker {
  margin: 0 0 1.25rem;
  font-size: var(--home-caption);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--home-muted);
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

/* ── Hero 双 CTA ── */
.hero__cta {
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--home-body);
  font-weight: 500;
  color: var(--home-fg);
  text-decoration: none;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--home-fg);
  transition: border-color 0.2s ease, color 0.2s ease, gap 0.2s ease;
}

.cta-primary:hover {
  color: var(--home-accent);
  border-bottom-color: var(--home-accent);
}

.cta-primary:hover .cta-primary__arrow {
  color: var(--home-accent);
  transform: translateX(3px);
}

.cta-primary__arrow {
  color: var(--home-muted);
  transition: color 0.2s ease, transform 0.2s ease;
}

.cta-secondary {
  font-size: var(--home-sm);
  color: var(--home-secondary);
  text-decoration: none;
  padding-bottom: 0.125rem;
  border-bottom: 1px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.cta-secondary:hover {
  color: var(--home-fg);
  border-bottom-color: var(--home-border);
}

.cta-primary--lg {
  font-size: 1.25rem;
  padding: 0.875rem 0;
}

.hero :deep(.preview) {
  margin-top: var(--home-gap-block);
  text-align: left;
}

/* ── Section ── */
.section {
  padding: var(--home-gap-section) var(--spacing-lg);
}

.section__inner {
  max-width: 860px;
  margin: 0 auto;
}

.section__inner--narrow {
  max-width: 680px;
}

.section__inner--wide {
  max-width: 1080px;
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

/* ── 结尾大号 CTA ── */
.section--final-cta {
  padding-top: clamp(2.5rem, 6vw, 4rem);
  padding-bottom: clamp(3.5rem, 8vw, 6rem);
  text-align: center;
}

.final-cta__title {
  margin: 0 0 1rem;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--home-fg);
}

.final-cta__sub {
  margin: 0 0 2.5rem;
  font-size: var(--home-body);
  color: var(--home-secondary);
}

.final-cta__actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

/* ── 动效 ── */
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

  .hero__cta,
  .final-cta__actions {
    gap: 1.25rem;
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
