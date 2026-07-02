import { _ as __nuxt_component_0 } from './nuxt-link-DP061rWi.mjs';
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
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';
import 'vue-router';
import '@vue/shared';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = {
  __name: "study",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "同步学习" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "info-page" }, _attrs))} data-v-92d14460><section class="info-page__header" data-v-92d14460><div class="container" data-v-92d14460><span class="info-page__tag" data-v-92d14460>同步学习</span><h1 class="info-page__title" data-v-92d14460>跟着节奏，稳步前行</h1><p class="info-page__desc" data-v-92d14460> 与学校课程进度同步，课上学、课后练，让课堂内容真正吸收内化。 当前功能建设中，敬请期待。 </p></div></section><section class="info-page__body" data-v-92d14460><div class="container info-page__container" data-v-92d14460><div class="info-card" data-v-92d14460><div class="info-card__icon" data-v-92d14460>📚</div><h2 class="info-card__title" data-v-92d14460>七年级 · 上学期</h2><p class="info-card__desc" data-v-92d14460>人教版 · 初中一年级同步课程</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/course",
        class: "info-card__link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`前往课程中心 →`);
          } else {
            return [
              createTextVNode("前往课程中心 →")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/study.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const study = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-92d14460"]]);

export { study as default };
//# sourceMappingURL=study-DvcfByzM.mjs.map
