import { _ as __nuxt_component_0 } from './nuxt-link-DQpUrDUS.mjs';
import { withAsyncContext, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { g as useRoute, f as useHead, u as useAsyncData } from './server.mjs';
import { M as Markdown } from './Markdown-Bjx8TwwA.mjs';
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

async function useLesson(slug, options = {}) {
  var _a;
  const key = `lesson:${slug || "empty"}`;
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => slug ? $fetch(`/api/lesson/${slug}`) : null,
    {
      default: () => null,
      server: true,
      lazy: (_a = options.lazy) != null ? _a : false,
      ...options
    }
  );
  return {
    lesson: data,
    loading: pending,
    error,
    refresh
  };
}
const _sfc_main = {
  __name: "[lesson]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const lessonSlug = Array.isArray(route.params.lesson) ? route.params.lesson[0] : route.params.lesson;
    const { lesson, loading } = ([__temp, __restore] = withAsyncContext(() => useLesson(lessonSlug)), __temp = await __temp, __restore(), __temp);
    const chapterSlug = computed(() => {
      var _a, _b;
      return ((_b = (_a = lesson.value) == null ? void 0 : _a.chapter) == null ? void 0 : _b.slug) || route.params.chapter;
    });
    useHead({
      title: computed(() => {
        var _a, _b, _c;
        const parts = [];
        if ((_a = lesson.value) == null ? void 0 : _a.title) parts.push(lesson.value.title);
        if ((_c = (_b = lesson.value) == null ? void 0 : _b.chapter) == null ? void 0 : _c.title) parts.push(lesson.value.chapter.title);
        parts.push("\u8BFE\u65F6");
        return parts.join(" \xB7 ");
      })
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "lesson-detail" }, _attrs))} data-v-d82cfb40><section class="lesson-detail__header" data-v-d82cfb40><div class="container lesson-detail__container" data-v-d82cfb40><nav class="lesson-detail__breadcrumb" data-v-d82cfb40>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/course",
        class: "lesson-detail__bc-link"
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
      _push(`<span class="lesson-detail__bc-sep" data-v-d82cfb40>/</span>`);
      if (chapterSlug.value) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/course/${chapterSlug.value}`,
          class: "lesson-detail__bc-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b, _c, _d;
            if (_push2) {
              _push2(`${ssrInterpolate(((_b = (_a2 = unref(lesson)) == null ? void 0 : _a2.chapter) == null ? void 0 : _b.title) || "\u7AE0\u8282")}`);
            } else {
              return [
                createTextVNode(toDisplayString(((_d = (_c = unref(lesson)) == null ? void 0 : _c.chapter) == null ? void 0 : _d.title) || "\u7AE0\u8282"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="lesson-detail__bc-sep" data-v-d82cfb40>/</span><span class="lesson-detail__bc-current" data-v-d82cfb40>${ssrInterpolate(((_a = unref(lesson)) == null ? void 0 : _a.title) || "\u8BFE\u65F6")}</span></nav></div></section><section class="lesson-detail__body" data-v-d82cfb40><div class="container lesson-detail__container" data-v-d82cfb40>`);
      if (unref(loading)) {
        _push(`<div class="lesson-detail__empty" data-v-d82cfb40>\u8BFE\u65F6\u5185\u5BB9\u52A0\u8F7D\u4E2D...</div>`);
      } else if (unref(lesson)) {
        _push(ssrRenderComponent(Markdown, { value: unref(lesson) }, null, _parent));
      } else {
        _push(`<div class="lesson-detail__empty" data-v-d82cfb40>\u8BFE\u65F6\u5185\u5BB9\u672A\u627E\u5230</div>`);
      }
      _push(`</div></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/course/[chapter]/[lesson].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _lesson_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d82cfb40"]]);

export { _lesson_ as default };
//# sourceMappingURL=_lesson_-CoizbMMG.mjs.map
