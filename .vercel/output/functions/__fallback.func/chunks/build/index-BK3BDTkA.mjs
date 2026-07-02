import { _ as __nuxt_component_0 } from './nuxt-link-DP061rWi.mjs';
import { withAsyncContext, mergeProps, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useHead } from './server.mjs';
import { u as useChapter } from './useChapter-DMJS9RZb.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useHead({ title: "课程中心" });
    const { chapters, loadChapters } = useChapter();
    [__temp, __restore] = withAsyncContext(() => loadChapters()), await __temp, __restore();
    console.log(chapters.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "course-index" }, _attrs))} data-v-42e0528e><section class="course-index__header" data-v-42e0528e><div class="container" data-v-42e0528e><span class="course-index__tag" data-v-42e0528e>课程中心</span><h1 class="course-index__title" data-v-42e0528e>探索数学的旅程</h1><p class="course-index__subtitle" data-v-42e0528e> 每一个章节都是精心设计的学习单元，从理解到应用，让你真正得心应手 </p></div></section><section class="course-index__body" data-v-42e0528e><div class="container" data-v-42e0528e>`);
      if (unref(chapters).length) {
        _push(`<div class="course-index__grid" data-v-42e0528e><!--[-->`);
        ssrRenderList(unref(chapters), (c) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: c.id,
            to: `/course/${c.slug}`,
            class: "chapter-card"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="chapter-card__order" data-v-42e0528e${_scopeId}>${ssrInterpolate(String(c.order).padStart(2, "0"))}</div><h2 class="chapter-card__title" data-v-42e0528e${_scopeId}>${ssrInterpolate(c.title)}</h2>`);
                if (c.description) {
                  _push2(`<p class="chapter-card__desc" data-v-42e0528e${_scopeId}>${ssrInterpolate(c.description)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="chapter-card__footer" data-v-42e0528e${_scopeId}><span class="chapter-card__cta" data-v-42e0528e${_scopeId}>进入学习 →</span></div>`);
              } else {
                return [
                  createVNode("div", { class: "chapter-card__order" }, toDisplayString(String(c.order).padStart(2, "0")), 1),
                  createVNode("h2", { class: "chapter-card__title" }, toDisplayString(c.title), 1),
                  c.description ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "chapter-card__desc"
                  }, toDisplayString(c.description), 1)) : createCommentVNode("", true),
                  createVNode("div", { class: "chapter-card__footer" }, [
                    createVNode("span", { class: "chapter-card__cta" }, "进入学习 →")
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/course/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-42e0528e"]]);

export { index as default };
//# sourceMappingURL=index-BK3BDTkA.mjs.map
