import { _ as __nuxt_component_0 } from './nuxt-link-B-wZu7nJ.mjs';
import { _ as __nuxt_component_1 } from './ContentRenderer-DiUG9AFZ.mjs';
import { defineComponent, computed, mergeProps, withCtx, createTextVNode, toDisplayString, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { a as useRoute, b as useFetch, u as useHead } from './server.mjs';
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
import 'property-information';
import 'minimark/hast';
import 'vue-router';
import '@vue/shared';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[chapter]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const chapterSlug = computed(
      () => Array.isArray(route.params.chapter) ? route.params.chapter[0] : route.params.chapter
    );
    const { data: currentChapter } = useFetch(
      () => `/api/chapter/${chapterSlug.value}`,
      {
        key: computed(() => `exercise-chapter-${chapterSlug.value}`),
        enabled: computed(() => !!chapterSlug.value)
      }
    );
    const { data: exercise, pending: loading } = useFetch(
      () => `/api/exercise/${chapterSlug.value}`,
      {
        key: computed(() => `exercise-${chapterSlug.value}`),
        enabled: computed(() => !!chapterSlug.value)
      }
    );
    const chapterTitle = computed(() => currentChapter.value?.title);
    useHead({
      title: computed(() => chapterTitle.value ? `${chapterTitle.value} · 练习` : "章节练习")
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ContentRenderer = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "exercise-page" }, _attrs))} data-v-d5bd9c9b><section class="exercise-page__header" data-v-d5bd9c9b><div class="container" data-v-d5bd9c9b><nav class="exercise-page__breadcrumb" data-v-d5bd9c9b>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/course",
        class: "exercise-page__bc-link"
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
      _push(`<span class="exercise-page__bc-sep" data-v-d5bd9c9b>/</span>`);
      if (chapterSlug.value) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/course/${chapterSlug.value}`,
          class: "exercise-page__bc-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(chapterTitle.value || "章节")}`);
            } else {
              return [
                createTextVNode(toDisplayString(chapterTitle.value || "章节"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="exercise-page__bc-sep" data-v-d5bd9c9b>/</span><span class="exercise-page__bc-current" data-v-d5bd9c9b>章节练习</span></nav><h1 class="exercise-page__title" data-v-d5bd9c9b>${ssrInterpolate(chapterTitle.value ? `${chapterTitle.value} · 练习` : "章节练习")}</h1><p class="exercise-page__desc" data-v-d5bd9c9b> 思考 → 尝试 → 提示 → 修正 → 理解 → 总结 → 迁移。让每一次练习都成为思维的生长。 </p></div></section><section class="exercise-page__body" data-v-d5bd9c9b><div class="container exercise-page__container" data-v-d5bd9c9b>`);
      if (unref(loading)) {
        _push(`<div class="exercise-page__empty" data-v-d5bd9c9b>练习内容加载中...</div>`);
      } else if (unref(exercise)) {
        _push(`<!--[--><h2 class="exercise-page__section-title" data-v-d5bd9c9b>${ssrInterpolate(unref(exercise).title || "练习题")}</h2>`);
        if (unref(exercise).description) {
          _push(`<div class="exercise-page__intro" data-v-d5bd9c9b>${ssrInterpolate(unref(exercise).description)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exercise)) {
          _push(ssrRenderComponent(_component_ContentRenderer, {
            value: unref(exercise)
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<div class="exercise-page__placeholder" data-v-d5bd9c9b><div class="placeholder-card" data-v-d5bd9c9b><div class="placeholder-card__icon" data-v-d5bd9c9b>✎</div><h3 class="placeholder-card__title" data-v-d5bd9c9b>练习内容准备中</h3><p class="placeholder-card__desc" data-v-d5bd9c9b> 本章节的交互练习正在精心设计中。请先完成课时学习，扎实掌握每个概念。 </p>`);
        if (chapterSlug.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/course/${chapterSlug.value}`,
            class: "placeholder-card__back"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` ← 返回章节页 `);
              } else {
                return [
                  createTextVNode(" ← 返回章节页 ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/exercise/[chapter].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _chapter_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d5bd9c9b"]]);

export { _chapter_ as default };
//# sourceMappingURL=_chapter_-BXLQlr26.mjs.map
