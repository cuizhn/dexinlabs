import { _ as __nuxt_component_0 } from './nuxt-link-MAa4oXM8.mjs';
import { withAsyncContext, computed, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { x as useRoute, w as useHead, u as useAsyncData } from './server.mjs';
import { M as Markdown } from './Markdown-lnWIAgwr.mjs';
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
import 'drizzle-orm';
import 'drizzle-orm/pg-core';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'marked';
import '@vue/shared';

async function useLesson(slug, options = {}) {
  const key = `lesson:${slug || "empty"}`;
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => slug ? $fetch(`/api/lesson/${slug}`) : null,
    {
      default: () => null,
      server: true,
      lazy: options.lazy ?? false,
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
    const chapterSlug = computed(() => lesson.value?.chapter?.slug || route.params.chapter);
    useHead({
      title: computed(() => {
        const parts = [];
        if (lesson.value?.title) parts.push(lesson.value.title);
        if (lesson.value?.chapter?.title) parts.push(lesson.value.chapter.title);
        parts.push("课时");
        return parts.join(" · ");
      })
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "lesson-detail" }, _attrs))} data-v-d82cfb40><section class="lesson-detail__header" data-v-d82cfb40><div class="container lesson-detail__container" data-v-d82cfb40><nav class="lesson-detail__breadcrumb" data-v-d82cfb40>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/course",
        class: "lesson-detail__bc-link"
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
      _push(`<span class="lesson-detail__bc-sep" data-v-d82cfb40>/</span>`);
      if (chapterSlug.value) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/course/${chapterSlug.value}`,
          class: "lesson-detail__bc-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(lesson)?.chapter?.title || "章节")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(lesson)?.chapter?.title || "章节"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="lesson-detail__bc-sep" data-v-d82cfb40>/</span><span class="lesson-detail__bc-current" data-v-d82cfb40>${ssrInterpolate(unref(lesson)?.title || "课时")}</span></nav></div></section><section class="lesson-detail__body" data-v-d82cfb40><div class="container lesson-detail__container" data-v-d82cfb40>`);
      if (unref(loading)) {
        _push(`<div class="lesson-detail__empty" data-v-d82cfb40>课时内容加载中...</div>`);
      } else if (unref(lesson)) {
        _push(ssrRenderComponent(Markdown, { value: unref(lesson) }, null, _parent));
      } else {
        _push(`<div class="lesson-detail__empty" data-v-d82cfb40>课时内容未找到</div>`);
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
//# sourceMappingURL=_lesson_-Bqifbk3Z.mjs.map
