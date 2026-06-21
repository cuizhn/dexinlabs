import { _ as __nuxt_component_0 } from './nuxt-link-CqUKJX5j.mjs';
import { mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { u as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:url';
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';
import 'vue-router';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "知识图谱" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "knowledge-page" }, _attrs))} data-v-62183b23><section class="knowledge-page__header" data-v-62183b23><div class="container container-sm" data-v-62183b23><h1 class="knowledge-page__title" data-v-62183b23>知识图谱</h1><p class="knowledge-page__description" data-v-62183b23>可视化展示知识点之间的关联关系</p></div></section><section class="knowledge-page__content" data-v-62183b23><div class="container container-sm text-center" data-v-62183b23><div class="knowledge-page__placeholder" data-v-62183b23><div class="knowledge-page__placeholder-icon" data-v-62183b23>🗺️</div><h2 class="knowledge-page__placeholder-title" data-v-62183b23>功能开发中</h2><p class="knowledge-page__placeholder-desc" data-v-62183b23>知识图谱功能正在规划中，敬请期待</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/courses",
        class: "btn btn--primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`浏览课程`);
          } else {
            return [
              createTextVNode("浏览课程")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/knowledge/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-62183b23"]]);

export { index as default };
//# sourceMappingURL=index-C8KJpsDh.mjs.map
