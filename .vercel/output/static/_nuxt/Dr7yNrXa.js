import{u as s,c as a,a as t,b as n,p as r,o as i}from"./DHzA-1Hd.js";import{_ as d}from"./DlAUqK2U.js";const p={class:"info-page"},c={class:"info-page__header"},_={class:"container"},l=`# 📖 基础排版示例

这是一段介绍 Morph-MD 组件库的 **基础段落**。我们支持 *斜体*、**粗体**、以及 \`行内代码\`。

> 💡 **引用块：** Morph-MD 遵循 *高内聚低耦合* 设计原则，使用 markdown-it 作为 Parser，不引入自定义 AST。

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
`,m={__name:"study",setup(h){return s({title:"同步学习"}),(f,e)=>{const o=r("MarkdownRenderer");return i(),a("div",p,[t("section",c,[t("div",_,[e[0]||(e[0]=t("span",{class:"info-page__tag"},"同步学习",-1)),e[1]||(e[1]=t("h1",{class:"info-page__title"},"跟着节奏，稳步前行",-1)),n(o,{content:l,class:"info-page__desc"})])])])}}},M=d(m,[["__scopeId","data-v-f2a4db5a"]]);export{M as default};
