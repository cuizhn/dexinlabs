import { _ as __nuxt_component_0 } from './nuxt-link-Dj5_oR5X.mjs';
import { withAsyncContext, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { a as useRoute, u as useHead } from './server.mjs';
import { M as MarkdownRenderer } from './MarkdownRenderer-BHlCAoZq.mjs';
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
import 'marked';

const _sfc_main = {
  __name: "[chapter]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const chapterSlug = Array.isArray(route.params.chapter) ? route.params.chapter[0] : route.params.chapter;
    const { exercise, loading: exerciseLoading } = ([__temp, __restore] = withAsyncContext(() => useExercise(chapterSlug)), __temp = await __temp, __restore(), __temp);
    const { currentChapter, loading: chapterLoading } = ([__temp, __restore] = withAsyncContext(() => useChapter(chapterSlug)), __temp = await __temp, __restore(), __temp);
    const loading = computed(() => exerciseLoading.value || chapterLoading.value);
    useHead({
      title: computed(() => chapterTitle.value ? `${chapterTitle.value} · 练习` : "章节练习")
    });
    const chapterTitle = computed(() => currentChapter.value && currentChapter.value.title);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "exercise-page" }, _attrs))} data-v-cc7e5069><section class="exercise-page__header" data-v-cc7e5069><div class="container" data-v-cc7e5069><nav class="exercise-page__breadcrumb" data-v-cc7e5069>`);
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
      _push(`<span class="exercise-page__bc-sep" data-v-cc7e5069>/</span>`);
      if (unref(chapterSlug)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/course/${unref(chapterSlug)}`,
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
      _push(`<span class="exercise-page__bc-sep" data-v-cc7e5069>/</span><span class="exercise-page__bc-current" data-v-cc7e5069>章节练习</span></nav><h1 class="exercise-page__title" data-v-cc7e5069>${ssrInterpolate(chapterTitle.value ? `${chapterTitle.value} · 练习` : "章节练习")}</h1><p class="exercise-page__desc" data-v-cc7e5069> 思考 → 尝试 → 提示 → 修正 → 理解 → 总结 → 迁移。让每一次练习都成为思维的生长。 </p></div></section><section class="exercise-page__body" data-v-cc7e5069><div class="container exercise-page__container" data-v-cc7e5069>`);
      if (loading.value) {
        _push(`<div class="exercise-page__empty" data-v-cc7e5069>练习内容加载中...</div>`);
      } else if (unref(exercise)) {
        _push(`<!--[--><h2 class="exercise-page__section-title" data-v-cc7e5069>${ssrInterpolate(unref(exercise).title || "练习题")}</h2>`);
        if (unref(exercise).description) {
          _push(`<div class="exercise-page__intro" data-v-cc7e5069>${ssrInterpolate(unref(exercise).description)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exercise)) {
          _push(ssrRenderComponent(MarkdownRenderer, { value: unref(exercise) }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<div class="exercise-page__placeholder" data-v-cc7e5069><div class="placeholder-card" data-v-cc7e5069><div class="placeholder-card__icon" data-v-cc7e5069>✎</div><h3 class="placeholder-card__title" data-v-cc7e5069>练习内容准备中</h3><p class="placeholder-card__desc" data-v-cc7e5069> 本章节的交互练习正在精心设计中。请先完成课时学习，扎实掌握每个概念。 </p>`);
        if (unref(chapterSlug)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/course/${unref(chapterSlug)}`,
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
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/exercise/[chapter].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _chapter_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cc7e5069"]]);

export { _chapter_ as default };
//# sourceMappingURL=_chapter_-zUChVwBI.mjs.map
