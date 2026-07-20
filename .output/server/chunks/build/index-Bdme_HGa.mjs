import { _ as __nuxt_component_0 } from './nuxt-link-3cq2DLXo.mjs';
import { withAsyncContext, mergeProps, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useHead, a as useAsyncData } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@vue/shared';

async function useCoursePage(slug, options = {}) {
  const key = "course-page:default";
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch("/api/course", { params: {} }),
    {
      /** 默认值，确保数据结构完整 */
      default: () => ({
        course: null,
        chapters: []
      }),
      /** 服务端预取（默认 true） */
      server: true,
      /** 懒加载模式（默认 false） */
      lazy: options.lazy ?? false
    }
  );
  return {
    course: computed(() => data.value?.course ?? null),
    chapters: computed(() => data.value?.chapters ?? []),
    loading: pending,
    error,
    refresh
  };
}
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useHead({ title: "课程中心" });
    const { chapters } = ([__temp, __restore] = withAsyncContext(() => useCoursePage()), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "course-index" }, _attrs))} data-v-ba14389a><section class="course-index__header" data-v-ba14389a><div class="container" data-v-ba14389a><span class="course-index__tag" data-v-ba14389a>课程中心</span><h1 class="course-index__title" data-v-ba14389a>探索数学的旅程</h1><p class="course-index__subtitle" data-v-ba14389a> 每一个章节都是精心设计的学习单元，从理解到应用，让你真正得心应手 </p></div></section><section class="course-index__body" data-v-ba14389a><div class="container" data-v-ba14389a>`);
      if (unref(chapters).length) {
        _push(`<div class="course-index__grid" data-v-ba14389a><!--[-->`);
        ssrRenderList(unref(chapters), (c) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: c.id,
            to: `/course/${c.slug}`,
            class: "chapter-card"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="chapter-card__order" data-v-ba14389a${_scopeId}>${ssrInterpolate(String(c.order).padStart(2, "0"))}</div><h2 class="chapter-card__title" data-v-ba14389a${_scopeId}>${ssrInterpolate(c.title)}</h2>`);
                if (c.description) {
                  _push2(`<p class="chapter-card__desc" data-v-ba14389a${_scopeId}>${ssrInterpolate(c.description)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="chapter-card__footer" data-v-ba14389a${_scopeId}><span class="chapter-card__cta" data-v-ba14389a${_scopeId}>进入学习 →</span></div>`);
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
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ba14389a"]]);

export { index as default };
//# sourceMappingURL=index-Bdme_HGa.mjs.map
