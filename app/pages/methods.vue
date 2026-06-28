<!-- 路由 URL: /methods -->
<!-- 页面路径: /methods -->
<!-- 学习方法：学会学习 -->
<template>
  <!-- 信息类页面通用根容器（与 study.vue 共用布局样式） -->
  <div class="info-page">
    <!-- Header 页面头部区域：展示页面标签、主标题和简介描述 -->
    <section class="info-page__header">
      <!-- container：全局布局工具类，限制内容最大宽度并水平居中 -->
      <div class="container">
        <!-- 页面分类标签：胶囊形小标签标识内容类别 -->
        <span class="info-page__tag">学习方法</span>
        <!-- 页面主标题 -->
        <h1 class="info-page__title">学会如何学习</h1>
        <!-- 页面简介/副标题说明 -->
        <p class="info-page__desc">
          数学不仅是知识，更是思维方式。掌握正确的方法，比做一百道题更重要。
        </p>
      </div>
    </section>
    <!-- Body 内容主体区域：四条学习方法原则列表 -->
    <section class="info-page__body">
      <div class="container info-page__container">
        <!-- 有序列表：四条核心学习方法原则（编号 01-04） -->
        <ol class="principle-list">
          <!-- 原则项 1：理解为先，记忆为后 -->
          <li class="principle-item">
            <span class="principle-item__num">01</span>
            <h3 class="principle-item__title">理解为先，记忆为后</h3>
            <p class="principle-item__desc">
              每一个公式和定理，先问"为什么"，再谈"怎么用"。知其然更知其所以然。
            </p>
          </li>
          <!-- 原则项 2：主动推导，而非被动阅读 -->
          <li class="principle-item">
            <span class="principle-item__num">02</span>
            <h3 class="principle-item__title">主动推导，而非被动阅读</h3>
            <p class="principle-item__desc">
              合上书，试着自己把定理推一遍。卡住的地方，就是你真正需要学习的地方。
            </p>
          </li>
          <!-- 原则项 3：少量高质量练习 > 题海战术 -->
          <li class="principle-item">
            <span class="principle-item__num">03</span>
            <h3 class="principle-item__title">少量高质量练习 > 题海战术</h3>
            <p class="principle-item__desc">
              一道好题值得花半小时思考，做完后花十分钟总结。比草草做十道题更有效。
            </p>
          </li>
          <!-- 原则项 4：建立知识之间的连接 -->
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
// import: useHead 来自 'nuxt/app'，Nuxt 官方提供的组合式 API，用于设置页面 <head> 元信息
import { useHead } from 'nuxt/app';

// useHead：Nuxt 自动注册可用的 API，此处设置页面浏览器标签栏标题
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
.info-page__body { padding: var(--spacing-xl) 0 var(--spacing-3xl); }
.info-page__container { max-width: 720px; }
.principle-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-lg); }
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
.principle-item__title { font-size: 1.125rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 var(--spacing-xs); }
.principle-item__desc { font-size: 0.95rem; color: var(--color-text-secondary); line-height: 1.6; margin: 0; }
@media (max-width: 600px) {
  .principle-item { grid-template-columns: 1fr; gap: var(--spacing-sm); }
}
</style>
