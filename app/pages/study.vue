<template>
  <div class="info-page">
    <section class="info-page__header">
      <div class="container">
        <span class="info-page__tag">同步学习</span>

        <h1 class="info-page__title">跟着节奏，稳步前行</h1>

         <ContentRenderer :content="md" class="info-page__desc" />
      </div>
    </section>


  </div>
</template>

<script setup>
import ContentRenderer from '../components/content/Renderer.vue'

useHead({ title: '同步学习' })
const md  = `# 同步学习

得心实验室采用**理解为先、应用为本**的学习理念，帮助你在数学的世界里稳步前行。

> 💡 **核心理念：** 每一个概念从本质讲起，先问"为什么"，再谈"怎么用"。知其然更知其所以然。

## 学习方式

- 系统化课程：完整覆盖中学数学知识体系
- 交互式练习：边学边练，即时反馈
- KaTeX 公式渲染：数学表达式清晰呈现
- 响应式设计：手机、平板、电脑随时随地学习

## 学习路径

1. 选择课程，进入章节学习
2. 阅读课时内容，理解核心概念
3. 完成章节练习，巩固所学知识
4. 持续进阶，逐步提升数学思维

---

`
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
  max-width: 800px;
}
.info-card {
  padding: var(--spacing-2xl);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  text-align: center;
}
.info-card__icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}
.info-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}
.info-card__desc {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-lg);
}
.info-card__link {
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
}
.info-card__link:hover {
  text-decoration: underline;
}
</style>
