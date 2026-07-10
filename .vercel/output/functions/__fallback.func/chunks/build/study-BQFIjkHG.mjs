import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { f as useHead } from './server.mjs';
import { M as Markdown } from './Markdown-Bjx8TwwA.mjs';
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
import '@vue/shared';
import './index-BVTkTKBe.mjs';
import 'marked';

const md = `# \u{1F4D6} \u57FA\u7840\u6392\u7248\u793A\u4F8B

\u8FD9\u662F\u4E00\u6BB5\u4ECB\u7ECD Morph-MD \u7EC4\u4EF6\u5E93\u7684 **\u57FA\u7840\u6BB5\u843D**\u3002\u6211\u4EEC\u652F\u6301 *\u659C\u4F53*\u3001**\u7C97\u4F53**\u3001\u4EE5\u53CA \`\u884C\u5185\u4EE3\u7801\`\u3002

> \u{1F4A1} **\u5F15\u7528\u5757\uFF1A** Morph-MD \u9075\u5FAA *\u9AD8\u5185\u805A\u4F4E\u8026\u5408* \u8BBE\u8BA1\u539F\u5219\uFF0C\u4F7F\u7528\u72EC\u7ACB\u7EF4\u62A4\u7684 Markdown Engine \u4F5C\u4E3A\u552F\u4E00\u89E3\u6790\u7BA1\u9053\uFF08Parser \u6280\u672F\u4E3A marked.lexer + MDAST \u517C\u5BB9 AST\uFF09\uFF0C\u901A\u8FC7 Transformer Plugin \u4F53\u7CFB\u7EDF\u4E00\u4EA7\u51FA TOC\u3001Excerpt\u3001ReadingTime \u7B49\u7ED3\u6784\u5316\u589E\u5F3A\u6570\u636E\u3002

## \u65E0\u5E8F\u5217\u8868

- Vue 3 \u7EC4\u4EF6\u5316\u5C01\u88C5
- Nuxt 3 \u5F00\u7BB1\u5373\u7528
- \u63D2\u4EF6\u5F0F\u6269\u5C55\uFF08highlight / katex / mermaid\uFF09
- SSR \u53CB\u597D\uFF0C\u5BA2\u6237\u7AEF hydrate

## \u6709\u5E8F\u5217\u8868

1. \u89E3\u6790 Markdown String
2. \u8F93\u51FA HTML String
3. \u901A\u8FC7 Plugin Pipeline
4. \u6700\u7EC8 v-html \u6E32\u67D3

## \u94FE\u63A5\u4E0E\u56FE\u7247

\u8BBF\u95EE [Morph-MD Repository](https://example.com/morph-md) \u83B7\u53D6\u66F4\u591A\u4FE1\u606F\u3002

## \u8868\u683C

| \u7279\u6027 | \u652F\u6301\u72B6\u6001 | \u5907\u6CE8 |
|------|----------|------|
| \u6807\u9898 H1-H6 | \u2705 | \u5B8C\u6574\u652F\u6301 |
| \u5217\u8868 (ul/ol) | \u2705 | \u5D4C\u5957\u652F\u6301 |
| \u4EE3\u7801\u9AD8\u4EAE | \u2705 | Prism.js |
| \u6570\u5B66\u516C\u5F0F | \u2705 | KaTeX |
| Mermaid \u56FE\u8868 | \u2705 | SSR fallback + client hydrate |

---
`;
const _sfc_main = {
  __name: "study",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "\u540C\u6B65\u5B66\u4E60" });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "info-page" }, _attrs))} data-v-84093043><section class="info-page__header" data-v-84093043><div class="container" data-v-84093043><span class="info-page__tag" data-v-84093043>\u540C\u6B65\u5B66\u4E60</span><h1 class="info-page__title" data-v-84093043>\u8DDF\u7740\u8282\u594F\uFF0C\u7A33\u6B65\u524D\u884C</h1>`);
      _push(ssrRenderComponent(Markdown, {
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
const study = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-84093043"]]);

export { study as default };
//# sourceMappingURL=study-BQFIjkHG.mjs.map
