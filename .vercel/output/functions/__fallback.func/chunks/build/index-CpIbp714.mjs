import { _ as __nuxt_component_0 } from './nuxt-link-DQpUrDUS.mjs';
import { withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { g as useRoute, f as useHead } from './server.mjs';
import { u as useChapter } from './useChapter-B1ZkgJ2m.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const chapterSlug = route.params.chapter;
    const { currentChapter } = ([__temp, __restore] = withAsyncContext(() => useChapter(chapterSlug)), __temp = await __temp, __restore(), __temp);
    useHead({
      title: computed(() => currentChapter.value ? `${currentChapter.value.title} · 章节` : "章节")
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "chapter-detail" }, _attrs))} data-v-4f0b8d78>`);
      if (unref(currentChapter)) {
        _push(`<!--[--><section class="chapter-detail__header" data-v-4f0b8d78><div class="container" data-v-4f0b8d78><nav class="chapter-detail__breadcrumb" data-v-4f0b8d78>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/course",
          class: "chapter-detail__bc-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`课程中心`);
            } else {
              return [
                createTextVNode("课程中心")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span class="chapter-detail__bc-sep" data-v-4f0b8d78>/</span><span class="chapter-detail__bc-current" data-v-4f0b8d78>${ssrInterpolate(unref(currentChapter).title)}</span></nav></div></section><section class="chapter-detail__body" data-v-4f0b8d78><div class="container chapter-detail__layout" data-v-4f0b8d78><div class="chapter-detail__main" data-v-4f0b8d78><h2 class="chapter-detail__section-title" data-v-4f0b8d78>课时内容</h2></div><aside class="chapter-detail__side" data-v-4f0b8d78>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/exercise/${unref(chapterSlug)}`,
          class: "exercise-card"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="exercise-card__icon" data-v-4f0b8d78${_scopeId}>✦</div><div class="exercise-card__body" data-v-4f0b8d78${_scopeId}><h3 class="exercise-card__title" data-v-4f0b8d78${_scopeId}>章节练习</h3><p class="exercise-card__desc" data-v-4f0b8d78${_scopeId}>巩固所学，训练数学思维</p></div><span class="exercise-card__cta" data-v-4f0b8d78${_scopeId}>开始练习 →</span>`);
            } else {
              return [
                createVNode("div", { class: "exercise-card__icon" }, "✦"),
                createVNode("div", { class: "exercise-card__body" }, [
                  createVNode("h3", { class: "exercise-card__title" }, "章节练习"),
                  createVNode("p", { class: "exercise-card__desc" }, "巩固所学，训练数学思维")
                ]),
                createVNode("span", { class: "exercise-card__cta" }, "开始练习 →")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</aside></div></section><!--]-->`);
      } else {
        _push(`<div class="chapter-detail__empty" data-v-4f0b8d78>暂未找到该章节</div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/course/[chapter]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4f0b8d78"]]);

export { index as default };
//# sourceMappingURL=index-CpIbp714.mjs.map
