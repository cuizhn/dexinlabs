import { _ as __nuxt_component_0 } from './nuxt-link-DP061rWi.mjs';
import { _ as __nuxt_component_1 } from './ContentRenderer-DxkgV8b8.mjs';
import { computed, withAsyncContext, mergeProps, withCtx, createTextVNode, unref, toDisplayString, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { a as useRoute, u as useHead } from './server.mjs';
import { u as useChapter } from './useChapter-C-e-yyhr.mjs';
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

const LessonRepository = {
  async findBySlug(slug) {
    try {
      return await $fetch(`/api/lesson/${slug}`);
    } catch {
      return null;
    }
  }
};
function useLesson() {
  const lesson = ref(null);
  const loading = ref(false);
  const loadLesson = async (slug) => {
    loading.value = true;
    try {
      lesson.value = await LessonRepository.findBySlug(slug);
    } finally {
      loading.value = false;
    }
  };
  return {
    lesson,
    loading,
    loadLesson
  };
}
const _sfc_main = {
  __name: "[lesson]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const chapterSlug = Array.isArray(route.params.chapter) ? route.params.chapter[0] : route.params.chapter;
    const lessonSlug = Array.isArray(route.params.lesson) ? route.params.lesson[0] : route.params.lesson;
    useHead({
      title: computed(() => lesson.value ? `${lesson.value.title} · 课时` : "课时")
    });
    const { lesson, loading, loadLesson } = useLesson();
    const { currentChapter, loadChapter } = useChapter();
    if (chapterSlug) [__temp, __restore] = withAsyncContext(() => loadChapter(chapterSlug)), await __temp, __restore();
    if (lessonSlug) [__temp, __restore] = withAsyncContext(() => loadLesson(lessonSlug)), await __temp, __restore();
    const chapterTitle = computed(() => currentChapter.value && currentChapter.value.title);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ContentRenderer = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "lesson-detail" }, _attrs))} data-v-5bdddd6f><section class="lesson-detail__header" data-v-5bdddd6f><div class="container lesson-detail__container" data-v-5bdddd6f><nav class="lesson-detail__breadcrumb" data-v-5bdddd6f>`);
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
      _push(`<span class="lesson-detail__bc-sep" data-v-5bdddd6f>/</span>`);
      if (unref(chapterSlug)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/course/${unref(chapterSlug)}`,
          class: "lesson-detail__bc-link"
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
      _push(`<span class="lesson-detail__bc-sep" data-v-5bdddd6f>/</span><span class="lesson-detail__bc-current" data-v-5bdddd6f>${ssrInterpolate(unref(lesson)?.title || "课时")}</span></nav></div></section><section class="lesson-detail__body" data-v-5bdddd6f><div class="container lesson-detail__container" data-v-5bdddd6f>`);
      if (unref(loading)) {
        _push(`<div class="lesson-detail__empty" data-v-5bdddd6f>课时内容加载中...</div>`);
      } else if (unref(lesson)) {
        _push(ssrRenderComponent(_component_ContentRenderer, { value: unref(lesson) }, null, _parent));
      } else {
        _push(`<div class="lesson-detail__empty" data-v-5bdddd6f>课时内容未找到</div>`);
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
const _lesson_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5bdddd6f"]]);

export { _lesson_ as default };
//# sourceMappingURL=_lesson_-DH53f3Md.mjs.map
