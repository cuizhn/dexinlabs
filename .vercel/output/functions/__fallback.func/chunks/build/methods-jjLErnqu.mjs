import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { u as useHead } from './server.mjs';
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
    useHead({ title: "学习方法" });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "info-page" }, _attrs))} data-v-0835ea21><section class="info-page__header" data-v-0835ea21><div class="container" data-v-0835ea21><span class="info-page__tag" data-v-0835ea21>学习方法</span><h1 class="info-page__title" data-v-0835ea21>学会如何学习</h1><p class="info-page__desc" data-v-0835ea21> 数学不仅是知识，更是思维方式。掌握正确的方法，比做一百道题更重要。 </p></div></section><section class="info-page__body" data-v-0835ea21><div class="container info-page__container" data-v-0835ea21><ol class="principle-list" data-v-0835ea21><li class="principle-item" data-v-0835ea21><span class="principle-item__num" data-v-0835ea21>01</span><h3 class="principle-item__title" data-v-0835ea21>理解为先，记忆为后</h3><p class="principle-item__desc" data-v-0835ea21> 每一个公式和定理，先问&quot;为什么&quot;，再谈&quot;怎么用&quot;。知其然更知其所以然。 </p></li><li class="principle-item" data-v-0835ea21><span class="principle-item__num" data-v-0835ea21>02</span><h3 class="principle-item__title" data-v-0835ea21>主动推导，而非被动阅读</h3><p class="principle-item__desc" data-v-0835ea21> 合上书，试着自己把定理推一遍。卡住的地方，就是你真正需要学习的地方。 </p></li><li class="principle-item" data-v-0835ea21><span class="principle-item__num" data-v-0835ea21>03</span><h3 class="principle-item__title" data-v-0835ea21>少量高质量练习 &gt; 题海战术</h3><p class="principle-item__desc" data-v-0835ea21> 一道好题值得花半小时思考，做完后花十分钟总结。比草草做十道题更有效。 </p></li><li class="principle-item" data-v-0835ea21><span class="principle-item__num" data-v-0835ea21>04</span><h3 class="principle-item__title" data-v-0835ea21>建立知识之间的连接</h3><p class="principle-item__desc" data-v-0835ea21> 每学一个新概念，想想它和你已掌握的知识有什么关系。数学是一张网，不是孤岛。 </p></li></ol></div></section></div>`);
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
//# sourceMappingURL=methods-jjLErnqu.mjs.map
