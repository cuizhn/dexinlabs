import { _ as __nuxt_component_0 } from './nuxt-link-DQpUrDUS.mjs';
import { withAsyncContext, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { g as useRoute, f as useHead, u as useAsyncData } from './server.mjs';
import { M as Markdown } from './Markdown-Bjx8TwwA.mjs';
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
import './index-BVTkTKBe.mjs';
import 'marked';

async function useExercise(slug, options = {}) {
  var _a;
  const key = `exercise:${slug || "empty"}`;
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => slug ? $fetch(`/api/exercise/${slug}`) : null,
    {
      default: () => null,
      server: true,
      lazy: (_a = options.lazy) != null ? _a : false,
      ...options
    }
  );
  return {
    exercise: data,
    loading: pending,
    error,
    refresh
  };
}
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
      title: computed(() => chapterTitle.value ? `${chapterTitle.value} \xB7 \u7EC3\u4E60` : "\u7AE0\u8282\u7EC3\u4E60")
    });
    const chapterTitle = computed(() => currentChapter.value && currentChapter.value.title);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "exercise-page" }, _attrs))} data-v-1298aeec><section class="exercise-page__header" data-v-1298aeec><div class="container" data-v-1298aeec><nav class="exercise-page__breadcrumb" data-v-1298aeec>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/course",
        class: "exercise-page__bc-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u8BFE\u7A0B\u4E2D\u5FC3`);
          } else {
            return [
              createTextVNode("\u8BFE\u7A0B\u4E2D\u5FC3")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span class="exercise-page__bc-sep" data-v-1298aeec>/</span>`);
      if (unref(chapterSlug)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/course/${unref(chapterSlug)}`,
          class: "exercise-page__bc-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(chapterTitle.value || "\u7AE0\u8282")}`);
            } else {
              return [
                createTextVNode(toDisplayString(chapterTitle.value || "\u7AE0\u8282"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="exercise-page__bc-sep" data-v-1298aeec>/</span><span class="exercise-page__bc-current" data-v-1298aeec>\u7AE0\u8282\u7EC3\u4E60</span></nav><h1 class="exercise-page__title" data-v-1298aeec>${ssrInterpolate(chapterTitle.value ? `${chapterTitle.value} \xB7 \u7EC3\u4E60` : "\u7AE0\u8282\u7EC3\u4E60")}</h1><p class="exercise-page__desc" data-v-1298aeec> \u601D\u8003 \u2192 \u5C1D\u8BD5 \u2192 \u63D0\u793A \u2192 \u4FEE\u6B63 \u2192 \u7406\u89E3 \u2192 \u603B\u7ED3 \u2192 \u8FC1\u79FB\u3002\u8BA9\u6BCF\u4E00\u6B21\u7EC3\u4E60\u90FD\u6210\u4E3A\u601D\u7EF4\u7684\u751F\u957F\u3002 </p></div></section><section class="exercise-page__body" data-v-1298aeec><div class="container exercise-page__container" data-v-1298aeec>`);
      if (loading.value) {
        _push(`<div class="exercise-page__empty" data-v-1298aeec>\u7EC3\u4E60\u5185\u5BB9\u52A0\u8F7D\u4E2D...</div>`);
      } else if (unref(exercise)) {
        _push(`<!--[--><h2 class="exercise-page__section-title" data-v-1298aeec>${ssrInterpolate(unref(exercise).title || "\u7EC3\u4E60\u9898")}</h2>`);
        if (unref(exercise).description) {
          _push(`<div class="exercise-page__intro" data-v-1298aeec>${ssrInterpolate(unref(exercise).description)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exercise)) {
          _push(ssrRenderComponent(Markdown, { value: unref(exercise) }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<div class="exercise-page__placeholder" data-v-1298aeec><div class="placeholder-card" data-v-1298aeec><div class="placeholder-card__icon" data-v-1298aeec>\u270E</div><h3 class="placeholder-card__title" data-v-1298aeec>\u7EC3\u4E60\u5185\u5BB9\u51C6\u5907\u4E2D</h3><p class="placeholder-card__desc" data-v-1298aeec> \u672C\u7AE0\u8282\u7684\u4EA4\u4E92\u7EC3\u4E60\u6B63\u5728\u7CBE\u5FC3\u8BBE\u8BA1\u4E2D\u3002\u8BF7\u5148\u5B8C\u6210\u8BFE\u65F6\u5B66\u4E60\uFF0C\u624E\u5B9E\u638C\u63E1\u6BCF\u4E2A\u6982\u5FF5\u3002 </p>`);
        if (unref(chapterSlug)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/course/${unref(chapterSlug)}`,
            class: "placeholder-card__back"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u2190 \u8FD4\u56DE\u7AE0\u8282\u9875 `);
              } else {
                return [
                  createTextVNode(" \u2190 \u8FD4\u56DE\u7AE0\u8282\u9875 ")
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
const _chapter_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1298aeec"]]);

export { _chapter_ as default };
//# sourceMappingURL=_chapter_-gampC516.mjs.map
