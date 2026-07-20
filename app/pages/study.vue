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
import { useHead } from 'nuxt/app'
import ContentRenderer from '../components/content/Renderer.vue'

useHead({ title: '同步学习' })
const md  = `# 📖 基础排版示例

这是一段介绍 Morph-MD 组件库的 **基础段落**。我们支持 *斜体*、**粗体**、以及 \`行内代码\`。

> 💡 **引用块：** Morph-MD 遵循 *高内聚低耦合* 设计原则，使用独立维护的 Markdown Engine 作为唯一解析管道（Parser 技术为 marked.lexer + MDAST 兼容 AST），通过 Transformer Plugin 体系统一产出 TOC、Excerpt、ReadingTime 等结构化增强数据。

## 无序列表

- Vue 3 组件化封装
- Nuxt 3 开箱即用
- 插件式扩展（highlight / katex / mermaid）
- SSR 友好，客户端 hydrate

## 有序列表

1. 解析 Markdown String
2. 输出 HTML String
3. 通过 Plugin Pipeline
4. 最终 v-html 渲染

## 链接与图片

访问 [Morph-MD Repository](https://example.com/morph-md) 获取更多信息。

## 表格

| 特性 | 支持状态 | 备注 |
|------|----------|------|
| 标题 H1-H6 | ✅ | 完整支持 |
| 列表 (ul/ol) | ✅ | 嵌套支持 |
| 代码高亮 | ✅ | Prism.js |
| 数学公式 | ✅ | KaTeX |
| Mermaid 图表 | ✅ | SSR fallback + client hydrate |

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
