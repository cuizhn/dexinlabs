import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
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
import '@vue/shared';

const _sfc_main = {
  __name: "methods",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "\u5B66\u4E60\u65B9\u6CD5" });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "info-page" }, _attrs))} data-v-0835ea21><section class="info-page__header" data-v-0835ea21><div class="container" data-v-0835ea21><span class="info-page__tag" data-v-0835ea21>\u5B66\u4E60\u65B9\u6CD5</span><h1 class="info-page__title" data-v-0835ea21>\u5B66\u4F1A\u5982\u4F55\u5B66\u4E60</h1><p class="info-page__desc" data-v-0835ea21> \u6570\u5B66\u4E0D\u4EC5\u662F\u77E5\u8BC6\uFF0C\u66F4\u662F\u601D\u7EF4\u65B9\u5F0F\u3002\u638C\u63E1\u6B63\u786E\u7684\u65B9\u6CD5\uFF0C\u6BD4\u505A\u4E00\u767E\u9053\u9898\u66F4\u91CD\u8981\u3002 </p></div></section><section class="info-page__body" data-v-0835ea21><div class="container info-page__container" data-v-0835ea21><ol class="principle-list" data-v-0835ea21><li class="principle-item" data-v-0835ea21><span class="principle-item__num" data-v-0835ea21>01</span><h3 class="principle-item__title" data-v-0835ea21>\u7406\u89E3\u4E3A\u5148\uFF0C\u8BB0\u5FC6\u4E3A\u540E</h3><p class="principle-item__desc" data-v-0835ea21> \u6BCF\u4E00\u4E2A\u516C\u5F0F\u548C\u5B9A\u7406\uFF0C\u5148\u95EE&quot;\u4E3A\u4EC0\u4E48&quot;\uFF0C\u518D\u8C08&quot;\u600E\u4E48\u7528&quot;\u3002\u77E5\u5176\u7136\u66F4\u77E5\u5176\u6240\u4EE5\u7136\u3002 </p></li><li class="principle-item" data-v-0835ea21><span class="principle-item__num" data-v-0835ea21>02</span><h3 class="principle-item__title" data-v-0835ea21>\u4E3B\u52A8\u63A8\u5BFC\uFF0C\u800C\u975E\u88AB\u52A8\u9605\u8BFB</h3><p class="principle-item__desc" data-v-0835ea21> \u5408\u4E0A\u4E66\uFF0C\u8BD5\u7740\u81EA\u5DF1\u628A\u5B9A\u7406\u63A8\u4E00\u904D\u3002\u5361\u4F4F\u7684\u5730\u65B9\uFF0C\u5C31\u662F\u4F60\u771F\u6B63\u9700\u8981\u5B66\u4E60\u7684\u5730\u65B9\u3002 </p></li><li class="principle-item" data-v-0835ea21><span class="principle-item__num" data-v-0835ea21>03</span><h3 class="principle-item__title" data-v-0835ea21>\u5C11\u91CF\u9AD8\u8D28\u91CF\u7EC3\u4E60 &gt; \u9898\u6D77\u6218\u672F</h3><p class="principle-item__desc" data-v-0835ea21> \u4E00\u9053\u597D\u9898\u503C\u5F97\u82B1\u534A\u5C0F\u65F6\u601D\u8003\uFF0C\u505A\u5B8C\u540E\u82B1\u5341\u5206\u949F\u603B\u7ED3\u3002\u6BD4\u8349\u8349\u505A\u5341\u9053\u9898\u66F4\u6709\u6548\u3002 </p></li><li class="principle-item" data-v-0835ea21><span class="principle-item__num" data-v-0835ea21>04</span><h3 class="principle-item__title" data-v-0835ea21>\u5EFA\u7ACB\u77E5\u8BC6\u4E4B\u95F4\u7684\u8FDE\u63A5</h3><p class="principle-item__desc" data-v-0835ea21> \u6BCF\u5B66\u4E00\u4E2A\u65B0\u6982\u5FF5\uFF0C\u60F3\u60F3\u5B83\u548C\u4F60\u5DF2\u638C\u63E1\u7684\u77E5\u8BC6\u6709\u4EC0\u4E48\u5173\u7CFB\u3002\u6570\u5B66\u662F\u4E00\u5F20\u7F51\uFF0C\u4E0D\u662F\u5B64\u5C9B\u3002 </p></li></ol></div></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/methods.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const methods = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0835ea21"]]);

export { methods as default };
//# sourceMappingURL=methods-BoDjxhvh.mjs.map
