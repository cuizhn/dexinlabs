import{B as s,D as a,E as t,G as o,C as r}from"./C48kEr45.js";import{M as n}from"./CigMelYD.js";import{_ as i}from"./DlAUqK2U.js";const d={class:"info-page"},p={class:"info-page__header"},l={class:"container"},c=`# 📖 基础排版示例

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
`,_={__name:"study",setup(m){return s({title:"同步学习"}),(g,e)=>(r(),a("div",d,[t("section",p,[t("div",l,[e[0]||(e[0]=t("span",{class:"info-page__tag"},"同步学习",-1)),e[1]||(e[1]=t("h1",{class:"info-page__title"},"跟着节奏，稳步前行",-1)),o(n,{content:c,class:"info-page__desc"})])])]))}},u=i(_,[["__scopeId","data-v-84093043"]]);export{u as default};
