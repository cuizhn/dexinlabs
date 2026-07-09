import { resolveComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { f as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'drizzle-orm';
import 'node:process';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'drizzle-orm/pg-core';
import 'marked';
import '@vue/shared';

const md = `# 📖 基础排版示例

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
`;
const _sfc_main = {
  __name: "study",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "同步学习" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MarkdownRenderer = resolveComponent("MarkdownRenderer");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "info-page" }, _attrs))} data-v-f2a4db5a><section class="info-page__header" data-v-f2a4db5a><div class="container" data-v-f2a4db5a><span class="info-page__tag" data-v-f2a4db5a>同步学习</span><h1 class="info-page__title" data-v-f2a4db5a>跟着节奏，稳步前行</h1>`);
      _push(ssrRenderComponent(_component_MarkdownRenderer, {
        content: md,
        class: "info-page__desc"
      }, null, _parent));
      _push(`</div></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const study = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f2a4db5a"]]);

export { study as default };
//# sourceMappingURL=study-CZX6Mzn6.mjs.map
