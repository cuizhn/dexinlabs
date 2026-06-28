<!-- 路由 URL: /about -->
<!-- 页面路径: /about -->
<!-- 关于我们：Dexin Labs 品牌故事 -->
<template>
  <!-- 关于页面根容器 -->
  <div class="about-page">
    <!-- Hero 主视觉区域：展示品牌名称、核心理念标语和品牌口号 -->
    <section class="about-page__hero">
      <!-- container：全局布局工具类（app/assets/styles/ 中定义），限制内容最大宽度并居中 -->
      <div class="container about-page__hero-inner">
        <!-- 品牌标识文字：等宽字体大写展示 Dexin Labs 名称 -->
        <span class="about-page__brand">Dexin Labs</span>
        <!-- 页面主标题：核心理念，含渐变色强调文字 -->
        <h1 class="about-page__title">理解为先，应用为本。<br/><span class="about-page__accent">让学习真正得心应手。</span></h1>
        <!-- 品牌口号/标语 -->
        <p class="about-page__slogan">「 数字流动处，思维生长时 」</p>
      </div>
    </section>

    <!-- Story 品牌故事区域：分块介绍创立原因和核心原则 -->
    <section class="about-page__story">
      <div class="container about-page__container">
        <!-- 故事块 1：我们的故事 - 平台创立的初衷与理念 -->
        <div class="story-block">
          <span class="story-block__tag">我们的故事</span>
          <h2 class="story-block__title">为什么做这个平台</h2>
          <p class="story-block__para">
            Dexin Labs，中文名为「得心实验室」，名字来源于核心理念「得心应手」。
            我们相信，真正的学习不是被动地接收知识，而是让知识与思维在心中生长，
            最终达到「运用自如，得心应手」的境界。
          </p>
          <p class="story-block__para">
            太多学生把数学等同于刷题和记忆公式。我们想改变这一点。
            在 Dexin Labs，每一个概念都从「为什么」开始，每一道练习都是一次思维训练，
            每一个章节的终点不是「我记住了」，而是「我理解了，我会用了」。
          </p>
        </div>

        <!-- 故事块 2：我们的原则 - 四大核心价值观卡片网格 -->
        <div class="story-block">
          <span class="story-block__tag">我们的原则</span>
          <!-- 核心原则网格：2列布局，响应式下变为单列 -->
          <div class="principles-grid">
            <!-- 原则卡片 1：理解为先 -->
            <div class="principle-card">
              <h3>理解为先</h3>
              <p>每个概念从本质讲起，不讲清楚为什么的内容，不放进课程。</p>
            </div>
            <!-- 原则卡片 2：应用为本 -->
            <div class="principle-card">
              <h3>应用为本</h3>
              <p>数学不是纸上谈兵。每个知识点都要有真实的问题和应用场景。</p>
            </div>
            <!-- 原则卡片 3：长期可持续 -->
            <div class="principle-card">
              <h3>长期可持续</h3>
              <p>个人开发者项目，不靠融资驱动用户焦虑，只靠内容质量赢得信任。</p>
            </div>
            <!-- 原则卡片 4：科学 + 教育 + 实验室 -->
            <div class="principle-card">
              <h3>科学 + 教育 + 实验室</h3>
              <p>用科学家的严谨做课程，用设计师的审美做体验，用实验室的心态做实验。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// import: useHead 来自 'nuxt/app'，Nuxt 官方提供的组合式 API，用于设置页面 <head> 元信息
import { useHead } from 'nuxt/app';

// useHead：Nuxt 自动注册可用的 API，此处设置页面浏览器标签栏标题
useHead({ title: '关于 Dexin Labs' })
</script>

<style scoped>
.about-page__hero {
  padding: var(--spacing-3xl) 0 var(--spacing-2xl);
  text-align: center;
  background:
    radial-gradient(1000px 400px at 50% -10%, var(--color-primary-light), transparent 60%),
    linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.about-page__hero-inner { max-width: 720px; margin: 0 auto; }
.about-page__brand {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--color-primary);
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: var(--spacing-xl);
}
.about-page__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
  margin: 0 0 var(--spacing-lg);
}
.about-page__accent { color: var(--color-primary); }
.about-page__slogan {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  letter-spacing: 0.08em;
  margin: 0;
}
.about-page__story { padding: var(--spacing-2xl) 0 var(--spacing-3xl); }
.about-page__container { max-width: 760px; margin: 0 auto; }
.story-block { margin-bottom: var(--spacing-3xl); }
.story-block__tag {
  display: inline-block;
  padding: 4px 14px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 100px;
  margin-bottom: var(--spacing-md);
}
.story-block__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}
.story-block__para {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md);
}
.principles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}
.principle-card {
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
}
.principle-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.principle-card p {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}
@media (max-width: 640px) {
  .about-page__title { font-size: 1.875rem; }
  .principles-grid { grid-template-columns: 1fr; }
}
</style>
