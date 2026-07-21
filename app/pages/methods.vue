<template>
  <div class="info-page">
    <section class="info-page__header">
      <div class="container">
        <span class="info-page__tag">学习方法</span>

        <h1 class="info-page__title">学会如何学习</h1>

        <p class="info-page__desc"> 数学不仅是知识，更是思维方式。掌握正确的方法，比做一百道题更重要。 </p>
      </div>
    </section>

    <section class="info-page__body">
      <div class="container info-page__container">
        <ol class="principle-list">
          <li class="principle-item">
            <span class="principle-item__num">01</span>
            <h3 class="principle-item__title">理解为先，记忆为后</h3>
            <p class="principle-item__desc"> 每一个公式和定理，先问"为什么"，再谈"怎么用"。知其然更知其所以然。 </p>
          </li>

          <li class="principle-item">
            <span class="principle-item__num">02</span>
            <h3 class="principle-item__title">主动推导，而非被动阅读</h3>
            <p class="principle-item__desc"> 合上书，试着自己把定理推一遍。卡住的地方，就是你真正需要学习的地方。 </p>
          </li>

          <li class="principle-item">
            <span class="principle-item__num">03</span>
            <h3 class="principle-item__title">少量高质量练习 > 题海战术</h3>
            <p class="principle-item__desc"> 一道好题值得花半小时思考，做完后花十分钟总结。比草草做十道题更有效。 </p>
          </li>

          <li class="principle-item">
            <span class="principle-item__num">04</span>
            <h3 class="principle-item__title">建立知识之间的连接</h3>
            <p class="principle-item__desc">
              每学一个新概念，想想它和你已掌握的知识有什么关系。数学是一张网，不是孤岛。
            </p>
          </li>
        </ol>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 学习方法页面 - 展示四大数学学习原则
useHead({ title: '学习方法' })
</script>

<style scoped>
.info-page__header {
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-secondary), transparent);
}
.info-page__tag {
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
.info-page__title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
}
.info-page__desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
}
.info-page__body {
  padding: var(--spacing-xl) 0 var(--spacing-3xl);
}
.info-page__container {
  max-width: 720px;
}
.principle-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.principle-item {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  align-items: start;
}
.principle-item__num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  padding-top: 2px;
}
.principle-item__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}
.principle-item__desc {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}
@media (max-width: 600px) {
  .principle-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
}
</style>
