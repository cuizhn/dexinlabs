<template>
  <div class="about-page">
    <section class="about-page__hero">
      <div class="container about-page__hero-inner">
        <span class="about-page__brand">Dexin Labs</span>

        <h1 class="about-page__title"
          >理解为先，应用为本。<br /><span class="about-page__accent">让学习真正得心应手。</span></h1
        >

        <p class="about-page__slogan">「 数字流动处，思维生长时 」</p>
      </div>
    </section>

    <section class="about-page__story">
      <div class="container about-page__container">
        <div class="story-block">
          <span class="story-block__tag">我们的故事</span>
          <h2 class="story-block__title">为什么做这个平台</h2>
          <p class="story-block__para">
            Dexin Labs，中文名为「得心实验室」，名字来源于核心理念「得心应手」。
            我们相信，真正的学习不是被动地接收知识，而是让知识与思维在心中生长， 最终达到「运用自如，得心应手」的境界。
          </p>
          <p class="story-block__para">
            太多学生把数学等同于刷题和记忆公式。我们想改变这一点。 在 Dexin
            Labs，每一个概念都从「为什么」开始，每一道练习都是一次思维训练，
            每一个章节的终点不是「我记住了」，而是「我理解了，我会用了」。
          </p>
        </div>

        <div class="story-block">
          <span class="story-block__tag">我们的原则</span>

          <div class="principles-grid">
            <div class="principle-card">
              <h3>理解为先</h3>
              <p>每个概念从本质讲起，不讲清楚为什么的内容，不放进课程。</p>
            </div>

            <div class="principle-card">
              <h3>应用为本</h3>
              <p>数学不是纸上谈兵。每个知识点都要有真实的问题和应用场景。</p>
            </div>

            <div class="principle-card">
              <h3>长期可持续</h3>
              <p>个人开发者项目，不靠融资驱动用户焦虑，只靠内容质量赢得信任。</p>
            </div>

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
// 关于页面 - 品牌故事与核心原则展示
useHead({ title: '关于 Dexin Labs' })
</script>

<style scoped>
.about-page__hero {
  padding: var(--spacing-3xl) 0 var(--spacing-2xl);
  text-align: center;
  background: radial-gradient(1000px 400px at 50% -10%, var(--color-primary-light), transparent 60%),
    linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.about-page__hero-inner {
  max-width: 720px;
  margin: 0 auto;
}
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
.about-page__accent {
  color: var(--color-primary);
}
.about-page__slogan {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  letter-spacing: 0.08em;
  margin: 0;
}
.about-page__story {
  padding: var(--spacing-2xl) 0 var(--spacing-3xl);
}
.about-page__container {
  max-width: 760px;
  margin: 0 auto;
}
.story-block {
  margin-bottom: var(--spacing-3xl);
}
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
  .about-page__title {
    font-size: 1.875rem;
  }
  .principles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
